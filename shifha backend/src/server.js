const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const errorMiddleware = require('./middleware/error.middleware');
// (Burada genAI veya model tanımı olmayacak, sadece dotenv ve sunucu başlatma kodu kalacak)

// Helmet ile HTTP header güvenliği
app.use(helmet());

// CORS yapılandırması: Geliştirme ve production ortamı için güvenli ayar
const allowedOrigins = process.env.PRODUCTION_ORIGINS
  ? process.env.PRODUCTION_ORIGINS.split(',')
  : ["http://localhost:3000"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Login endpointi için rate limit (brute-force koruması)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // 15 dakikada en fazla 10 istek
  message: { success: false, error: 'Çok fazla deneme, lütfen daha sonra tekrar deneyin.' }
});

app.use(express.json({ limit: '10mb' })); // Büyük PDF dosyaları için limit artırıldı

const apiRouter = require('./api');
app.use('/api', apiRouter);

// Hasta işlemleri için rate limit (ör: 5 istek/dk)
const patientLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: process.env.NODE_ENV === 'development' ? 1000 : 5,
  message: { success: false, error: 'Çok fazla istek! Lütfen daha sonra tekrar deneyin.' }
});
// Analiz işlemleri için rate limit (ör: 3 istek/dk)
const analysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 3,
  message: { success: false, error: 'Çok fazla analiz isteği! Lütfen daha sonra tekrar deneyin.' }
});

// Merkezi error handler en sonda
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.set('trust proxy', 1);
