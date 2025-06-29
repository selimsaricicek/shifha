const express = require('express');
const cors = require('cors'); // 1. Adım: cors'u import et
const app = express();
const dotenv = require('dotenv');
dotenv.config();

// ----> EKLEYECEĞİNİZ KOD BURAYA <----
app.use(cors()); // 2. Adım: cors'u bir middleware olarak kullan (Rotalardan önce!)

const pdfRoutes = require('./routes/pdf.routes');
const patientRoutes = require('./routes/patient.routes');

app.use(express.json());
app.use('/api/pdf', pdfRoutes);
app.use('/api/patients', patientRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});