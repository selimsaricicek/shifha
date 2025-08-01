const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');
const { z } = require('zod');

// Güçlü şifre regex'i: En az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(strongPasswordRegex, 'Şifre en az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter içermelidir.'),
  name: z.string().min(1),
  tcKimlikNo: z.string().length(11, 'TC Kimlik No 11 haneli olmalıdır')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6) // Girişte eski ve yeni policy'yi birlikte kabul edeceğiz
});

/**
 * Supabase Auth ile kullanıcı kaydı
 * @param {{email: string, password: string, name: string}} input
 * @returns {Promise<object>} 
 * @throws {Error} 
 */
const register = async (input) => {
  console.log('📥 Gelen kayıt verisi:', input);
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    console.error('❌ Validation hatası:', parsed.error.errors);
    throw new Error('Geçersiz kayıt verisi: ' + parsed.error.errors.map(e => e.message).join(', '));
  }
  const { email, password, name, tcKimlikNo } = parsed.data;
  
  // Check email domain to determine role
  const isDoctor = email.toLowerCase().endsWith('@saglik.gov.tr');
  const isAdmin = email.toLowerCase().endsWith('@shifha.admin.tr');
  const role = isAdmin ? 'admin' : (isDoctor ? 'doctor' : 'patient');
  
  try {
    // Supabase Auth ile kullanıcı oluştur (Supabase şifreyi otomatik hashler)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role, tcKimlikNo },
      email_confirm: true // Email confirmation'ı otomatik onayla
    });
    
    if (error) {
      console.error('Supabase Auth Error:', error);
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('Kullanıcı oluşturulamadı');
    }
    
    console.log('✅ Kullanıcı başarıyla oluşturuldu:', data.user.id);
    
    // Create profile in profiles table (only for non-admin users)
    if (!isAdmin) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: name,
            updated_at: new Date().toISOString()
          }
        ])
        .select(); // Return the created profile
      
      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        // Don't throw error here as user is already created
        // Try to get existing profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (existingProfile) {
          console.log('✅ Mevcut profile bulundu');
        }
      } else {
        console.log('✅ Profile başarıyla oluşturuldu');
      }
    } else {
      console.log('🔧 Admin kullanıcısı için profile oluşturulmadı');
    }
    
      // If doctor, create doctor profile
  if (isDoctor) {
    const { error: doctorProfileError } = await supabase
      .from('doctor_profiles')
      .insert([
        {
          user_id: data.user.id,
          tc_kimlik_no: tcKimlikNo,
          full_name: name,
          email: email,
          hospital_id: null, // Optional field
          is_active: true
        }
      ])
      .select(); // Return the created doctor profile
    
    if (doctorProfileError) {
      console.error('❌ Doctor profile creation error:', doctorProfileError);
      // Try to get existing doctor profile
      const { data: existingDoctorProfile } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (existingDoctorProfile) {
        console.log('✅ Mevcut doctor profile bulundu');
      }
    } else {
      console.log('✅ Doctor profile başarıyla oluşturuldu');
    }
  }

  if (isAdmin) {
    const { error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          user_id: data.user.id,
          email: email,
          full_name: name,
          role: 'super_admin',
          is_active: true,
          permissions: '["all"]'
        }
      ])
      .select();
    
    if (adminError) {
      console.error('❌ Admin record creation error:', adminError);
      // Try to get existing admin record
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (existingAdmin) {
        console.log('✅ Mevcut admin kaydı bulundu');
      }
    } else {
      console.log('✅ Admin kaydı başarıyla oluşturuldu');
    }
  }
    
    return data.user;
  } catch (error) {
    console.error('❌ Register error:', error);
    throw error;
  }
};

/**
 * Supabase Auth ile kullanıcı girişi
 * @param {{email: string, password: string}} input
 * @returns {Promise<{user: object, token: string}>}
 * @throws {Error} Geçersiz veri, kullanıcı bulunamadı veya şifre yanlış
 */
const login = async (input) => {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) throw new Error('Geçersiz giriş verisi');
  const { email, password } = parsed.data;
  
  try {
    // Supabase Auth ile giriş (şifre karşılaştırması otomatik yapılır)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      console.error('❌ Login error:', error);
      throw new Error('Giriş başarısız: ' + (error?.message || 'Kullanıcı bulunamadı'));
    }
    
    console.log('✅ Kullanıcı başarıyla giriş yaptı:', data.user.id);

    // Kullanıcının rolünü al
    const userRole = data.user.user_metadata?.role;

    // Sadece doktor veya admin giriş yapabilir
    if (userRole === 'patient') {
      console.warn(`🚫 Yetkisiz giriş denemesi: ${email} (rol: ${userRole})`);
      throw new Error('Giriş yetkiniz bulunmamaktadır. Sadece doktorlar ve adminler giriş yapabilir.');
    }
    
    const isDoctor = email.toLowerCase().endsWith('@saglik.gov.tr');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
    }
    
    let doctorProfile = null;
    if (isDoctor) {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (doctorError) {
        console.error('❌ Doctor profile fetch error:', doctorError);
      } else if (doctorData) {
        doctorProfile = doctorData;
        console.log('✅ Doctor profile bulundu');
      }
    }
    
    const enhancedUser = {
      ...data.user,
      profile: profileData,
      doctorProfile: doctorProfile,
      isDoctor: isDoctor
    };
    
    const token = data.session.access_token;
    return { user: enhancedUser, token };
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

/**
 * @param {{email: string, password: string}} input
 * @returns {Promise<{user: object, token: string}>}
 * @throws {Error} 
 */
const adminLogin = async (input) => {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) throw new Error('Geçersiz giriş verisi');
  const { email, password } = parsed.data;
  
  if (!email.toLowerCase().endsWith('@shifha.admin.tr')) {
    throw new Error('Geçersiz admin email domain');
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      console.error('❌ Admin login error:', error);
      throw new Error('Admin girişi başarısız: ' + (error?.message || 'Admin bulunamadı'));
    }
    
    console.log('✅ Admin giriş denemesi:', data.user.id);
    console.log('📧 Admin email:', email);

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', data.user.id)
      .eq('is_active', true)
      .single();
    
    console.log('🔍 Admin sorgu sonucu:', { adminData, adminError });
    
    // Eğer user_id ile bulunamazsa, email ile de dene
    if (adminError || !adminData) {
      console.log('🔄 Email ile admin aranıyor:', email);
      const { data: adminByEmail, error: emailError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();
      
      console.log('📧 Email ile admin sorgu sonucu:', { adminByEmail, emailError });
      
      if (emailError || !adminByEmail) {
        console.error('❌ Admin verification failed:', { adminError, emailError });
        throw new Error('Admin yetkiniz bulunmamaktadır');
      }
      
      // Email ile bulunduysa, user_id'yi güncelle
      const { error: updateError } = await supabase
        .from('admins')
        .update({ user_id: data.user.id })
        .eq('email', email);
      
      if (updateError) {
        console.error('❌ Admin user_id update error:', updateError);
      } else {
        console.log('✅ Admin user_id güncellendi');
      }
      
      adminData = adminByEmail;
    }
    
    console.log('✅ Admin başarıyla doğrulandı:', adminData.id);
    
    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Admin profile fetch error:', profileError);
    }
    
    // Enhanced admin user data
    const enhancedUser = {
      ...data.user,
      profile: profileData,
      adminProfile: adminData,
      isAdmin: true,
      role: 'admin'
    };
    
    // Supabase JWT token
    const token = data.session.access_token;
    return { user: enhancedUser, token };
  } catch (error) {
    console.error('❌ Admin login error:', error);
    throw error;
  }
};

module.exports = { register, login, adminLogin };
