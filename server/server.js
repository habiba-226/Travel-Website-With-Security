// server.js — Wanderly Travel API
// Entry point for the Express backend

const express = require('express');
const cors = require('cors');
const path = require('path');

const destinationsRoute = require('./routes/destinations');
const bookingsRoute = require('./routes/bookings');
const newsletterRoute = require('./routes/newsletter');
const toursRoute = require('./routes/tours');
const postsRoute = require('./routes/posts');
const galleryRoute = require('./routes/gallery');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// Simple request logger so you can see traffic in the terminal
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.url}`);
  next();
});

// ---------- Routes ----------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wanderly-api', time: new Date() });
});

app.use('/api/destinations', destinationsRoute);
app.use('/api/bookings', bookingsRoute);
app.use('/api/newsletter', newsletterRoute);
app.use('/api/tours', toursRoute);
app.use('/api/posts', postsRoute);
app.use('/api/gallery', galleryRoute);

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// ---------- Error handler ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🌍  Wanderly API running on http://localhost:${PORT}`);
  console.log(`   Try:  http://localhost:${PORT}/api/destinations\n`);
});
