const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
// (Burada genAI veya model tanımı olmayacak, sadece dotenv ve sunucu başlatma kodu kalacak)

// Helmet ile HTTP header güvenliği
app.use(helmet());

// Geliştirme ortamı için CORS'u esnek bırak
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true
}));

// Login endpointi için rate limit (brute-force koruması)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // 15 dakikada en fazla 10 istek
  message: { success: false, error: 'Çok fazla deneme, lütfen daha sonra tekrar deneyin.' }
});

const pdfRoutes = require('./routes/pdf.routes');
const patientRoutes = require('./routes/patient.routes');
const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('./middleware/error.middleware');

app.use(express.json({ limit: '10mb' })); // Büyük PDF dosyaları için limit artırıldı
app.use('/api/pdf', pdfRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/auth', authLimiter, authRoutes);

// Merkezi error handler en sonda
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.set('trust proxy', 1);
