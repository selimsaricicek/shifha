// ...existing code...
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(express.json());
// ...existing code...
module.exports = app;
