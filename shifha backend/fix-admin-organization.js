require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL veya Key bulunamadı!');
    process.exit(1);
}

// Normal işlemler için anon key kullan
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin işlemler için service role key kullan (eğer varsa)
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function fixAdminOrganization() {
    try {
        console.log('🔍 Admin kullanıcısını arıyor...');
        
        // Admin kullanıcısını bul
        const adminEmail = 'testadmin@shifha.admin.tr';
        
        // Manuel olarak admin user ID'sini belirle (önceki loglardan)
        const adminUserId = 'be641553-cf46-47c1-868f-146eaf296291';
        
        console.log('✅ Admin kullanıcısı ID:', adminUserId);
        console.log('📧 Admin email:', adminEmail);
        
        // Organizasyonları listele
        console.log('🏥 Organizasyonları listeleniyor...');
        const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('*');
            
        if (orgError) {
            console.error('❌ Organizasyonlar alınamadı:', orgError);
            return;
        }
        
        console.log('📋 Mevcut organizasyonlar:', organizations.map(org => `${org.name} (${org.id})`));
        
        if (organizations.length === 0) {
            console.error('❌ Hiç organizasyon bulunamadı!');
            return;
        }
        
        // İlk organizasyonu seç (Shifha Tıp Merkezi)
        const selectedOrg = organizations.find(org => org.name.includes('Shifha')) || organizations[0];
        console.log('🎯 Seçilen organizasyon:', selectedOrg.name, selectedOrg.id);
        
        // 1. Profiles tablosuna admin kullanıcısını ekle
        console.log('👤 Profiles tablosunu kontrol ediyor...');
        const { data: existingProfile, error: profileCheckError } = await supabase
             .from('profiles')
             .select('*')
             .eq('id', adminUserId)
             .single();
             
         if (profileCheckError && profileCheckError.code !== 'PGRST116') {
             console.error('❌ Profile kontrolü hatası:', profileCheckError);
             return;
         }
         
         if (!existingProfile) {
             const { error: profileError } = await supabase
                 .from('profiles')
                 .insert({
                     id: adminUserId,
                     name: 'Test Admin'
                 });
                
            if (profileError) {
                console.error('❌ Profile oluşturulamadı:', profileError);
                return;
            }
            console.log('✅ Profile oluşturuldu');
        } else {
            console.log('✅ Profile zaten mevcut');
        }
        
        // 2. Admins tablosuna admin kullanıcısını ekle
        console.log('🔐 Admins tablosunu kontrol ediyor...');
        const { data: existingAdmin, error: adminCheckError } = await supabase
             .from('admins')
             .select('*')
             .eq('user_id', adminUserId)
             .single();
             
         if (adminCheckError && adminCheckError.code !== 'PGRST116') {
             console.error('❌ Admin kontrolü hatası:', adminCheckError);
             return;
         }
         
         if (!existingAdmin) {
             const { error: adminError } = await supabase
                 .from('admins')
                 .insert({
                     user_id: adminUserId,
                    email: adminEmail,
                    full_name: 'Test Admin',
                    role: 'admin', // Schema'ya göre 'admin' veya 'super_admin'
                    is_active: true,
                    permissions: {}
                });
                
            if (adminError) {
                console.error('❌ Admin kaydı oluşturulamadı:', adminError);
                return;
            }
            console.log('✅ Admin kaydı oluşturuldu');
        } else {
            console.log('✅ Admin kaydı zaten mevcut');
        }
        
        // 3. User_organizations tablosuna admin kullanıcısını ekle
        console.log('🏢 User_organizations tablosunu kontrol ediyor...');
        const { data: existingUserOrg, error: userOrgCheckError } = await supabase
             .from('user_organizations')
             .select('*')
             .eq('user_id', adminUserId)
             .eq('organization_id', selectedOrg.id)
             .single();
             
         if (userOrgCheckError && userOrgCheckError.code !== 'PGRST116') {
             console.error('❌ User organization kontrolü hatası:', userOrgCheckError);
             return;
         }
         
         if (!existingUserOrg) {
             const { error: userOrgError } = await supabase
                 .from('user_organizations')
                 .insert({
                     user_id: adminUserId,
                    organization_id: selectedOrg.id,
                    role: 'org_admin', // Schema'ya göre geçerli enum değeri
                    is_active: true
                });
                
            if (userOrgError) {
                console.error('❌ User organization bağlantısı oluşturulamadı:', userOrgError);
                return;
            }
            console.log('✅ User organization bağlantısı oluşturuldu');
        } else {
            console.log('✅ User organization bağlantısı zaten mevcut');
        }
        
        console.log('🎉 Admin kullanıcısı başarıyla yapılandırıldı!');
         console.log('📧 Email:', adminEmail);
         console.log('🆔 User ID:', adminUserId);
         console.log('🏥 Organization:', selectedOrg.name);
         console.log('👑 Admin Role: admin (admins tablosunda)');
         console.log('🔑 Org Role: org_admin (user_organizations tablosunda)');
        
    } catch (error) {
        console.error('❌ Genel hata:', error);
    }
}

fixAdminOrganization();