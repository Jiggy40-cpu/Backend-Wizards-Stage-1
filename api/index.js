const express = require('express');
const profilesRouter = require('./profiles');
const { initializeDb } = require('../lib/db');

const app = express();

// Middleware
app.use(express.json());

// CORS Header
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Database
initializeDb().catch(err => {
  console.error('Database initialization failed:', err);
});

// Routes
app.use('/api/profiles', profilesRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Wizards Stage 1 API' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// Export for Vercel
module.exports = app;