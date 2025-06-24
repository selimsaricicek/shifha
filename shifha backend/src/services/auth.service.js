// ...existing code...
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const register = async ({ email, password, name }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });
  return user;
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Kullanıcı bulunamadı');
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error('Şifre yanlış');
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { user, token };
};

module.exports = { register, login };
// ...existing code...
