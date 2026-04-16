require('dotenv').config();

const express = require('express');
const profilesRouter = require('./profiles');
const { initializeDb } = require('../lib/db');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

initializeDb().catch(err => {
  console.error('Database initialization failed:', err);
});

app.use('/api/profiles', profilesRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Wizards Stage 1 API' });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless function
module.exports = app;