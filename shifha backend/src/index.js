// ...existing code...
const express = require('express');
const app = require('./config/app');
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// ...existing code...
