// server.js — Wanderly Travel API
import express from "express";
import cors from "cors";
import destinationsRoute from "./routes/destinations.js";
import bookingsRoute from "./routes/bookings.js";
import newsletterRoute from "./routes/newsletter.js";
import toursRoute from "./routes/tours.js";
import postsRoute from "./routes/posts.js";
import galleryRoute from "./routes/gallery.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

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
  console.log(`Wanderly API running on http://localhost:${PORT}`);
});
