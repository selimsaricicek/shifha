// Merkezi hata yönetimi middleware'i
module.exports = (err, req, res, next) => {
  console.error('API Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: true,
    message: err.message || 'Sunucu hatası',
    details: err.details || undefined
  });
};
