const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');
const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

/**
 * Supabase Auth ile kullanıcı kaydı
 * @param {{email: string, password: string, name: string}} input
 * @returns {Promise<object>} Yeni kullanıcı verisi
 * @throws {Error} Geçersiz veri veya Supabase hatası
 */
const register = async (input) => {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) throw new Error('Geçersiz kayıt verisi');
  const { email, password, name } = parsed.data;
  // Supabase Auth ile kullanıcı oluştur
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: 'patient' }
  });
  if (error) throw new Error(error.message);
  // Profili ayrı bir tabloda tutmak isterseniz burada ekleyebilirsiniz
  return data.user;
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
  // Supabase Auth ile giriş
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error('Giriş başarısız: ' + (error?.message || 'Kullanıcı bulunamadı'));
  // Supabase JWT token'ı
  const token = data.session.access_token;
  return { user: data.user, token };
};

module.exports = { register, login };
