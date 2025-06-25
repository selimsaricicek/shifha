const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const pdfRoutes = require('./routes/pdf.routes');
app.use('/api/pdf', pdfRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
