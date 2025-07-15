// Merkezi hata yönetimi middleware'i
module.exports = (err, req, res, next) => {
  console.error('API Error:', err);
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  res.status(status).json({
    success: false,
    error: true,
    message: isProd ? 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.' : (err.message || 'Sunucu hatası'),
    details: isProd ? undefined : (err.details || err.stack)
  });
};
