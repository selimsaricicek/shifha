const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

// CORS yapılandırması: Geliştirme ve production ortamı için güvenli ayar
const allowedOrigins = process.env.PRODUCTION_ORIGINS
  ? process.env.PRODUCTION_ORIGINS.split(',')
  : ["http://localhost:3000", "http://localhost:3002", "http://localhost"];

const errorMiddleware = require('./middleware/error.middleware');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Session yönetimi için basit bir in-memory store (ileride Redis ile değiştirilecek)
const wsSessions = {};

io.on('connection', (socket) => {
  // Her bağlantı için benzersiz sessionId üret
  const sessionId = uuidv4();
  wsSessions[sessionId] = { socketId: socket.id, createdAt: Date.now() };
  socket.sessionId = sessionId;
  socket.emit('session', { sessionId });
  console.log(`🔌 Yeni WebSocket bağlantısı: ${socket.id}, sessionId: ${sessionId}`);

  // Frontend'den loginAttemptId gelirse, QR session ile eşleştir
  socket.on('registerQrSession', ({ loginAttemptId }) => {
    if (qrSessions[loginAttemptId]) {
      qrSessions[loginAttemptId].sessionId = sessionId;
      console.log(`✅ QR session eşleşti: loginAttemptId=${loginAttemptId}, sessionId=${sessionId}`);
    }
  });

  // Bağlantı kopunca session'ı temizle
  socket.on('disconnect', () => {
    delete wsSessions[sessionId];
    console.log(`❌ WebSocket bağlantısı koptu: ${socket.id}, sessionId: ${sessionId}`);
  });

  // Standart event örneği
  socket.on('event', (data) => {
    console.log('Event alındı:', data);
    // Burada event işleme/iletme yapılabilir
  });
});
// (Burada genAI veya model tanımı olmayacak, sadece dotenv ve sunucu başlatma kodu kalacak)

// Helmet ile HTTP header güvenliği
app.use(helmet());

// CORS yapılandırması: Geliştirme ve production ortamı için güvenli ayar
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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

// QR giriş oturumlarını takip için in-memory store
const qrSessions = {};

// QR session endpoint'inde loginAttemptId üretirken memory'e ekle
app.get('/api/auth/qr-session', (req, res) => {
  const loginAttemptId = uuidv4();
  const sessionData = {
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + 60000,
    sessionId: null
  };
  qrSessions[loginAttemptId] = sessionData;
  
  // 65 saniye sonra otomatik temizle
  setTimeout(() => {
    delete qrSessions[loginAttemptId];
  }, 65000);
  
  res.json({ loginAttemptId });
});

// QR doğrulama ve giriş API'si
app.post('/api/auth/verify-qr-scan', (req, res) => {
  const { loginAttemptId, doctorId } = req.body;
  if (!loginAttemptId || !doctorId) {
    return res.status(400).json({ success: false, message: 'Eksik veri' });
  }
  
  const session = qrSessions[loginAttemptId];
  if (!session) {
    return res.status(404).json({ success: false, message: 'Geçersiz veya süresi dolmuş QR kodu' });
  }
  if (session.status === 'completed') {
    return res.status(410).json({ success: false, message: 'Bu QR kodu zaten kullanıldı, lütfen yeni kod isteyin.' });
  }
  if (Date.now() > session.expiresAt) {
    return res.status(410).json({ success: false, message: 'QR kodunun süresi doldu, lütfen yeni kod isteyin.' });
  }
  
  session.status = 'completed';
  session.doctorId = doctorId;
  
  // WebSocket ile ilgili kullanıcıya loginSuccess event'i gönder
  if (session.sessionId && wsSessions[session.sessionId]) {
    io.to(wsSessions[session.sessionId].socketId).emit('loginSuccess', { token: 'YENI_WEB_JWT' });
    console.log(`🚀 loginSuccess event'i gönderildi: sessionId=${session.sessionId}`);
  }
  
  // 5 saniye sonra session'ı temizle
  setTimeout(() => {
    delete qrSessions[loginAttemptId];
  }, 5000);
  
  return res.json({ success: true, message: 'Giriş başarılı' });
});

// Merkezi error handler en sonda
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.set('trust proxy', 1);
