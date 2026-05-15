// routes/newsletter.js
const express = require('express');
const router = express.Router();

const subscribers = [];
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// POST /api/newsletter — subscribe to newsletter
router.post('/', (req, res) => {
  const { email, name } = req.body || {};

  const errors = {};
  if (!email || !isEmail(email)) errors.email = 'A valid email is required';
  if (name && name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors });
  }

  // Avoid duplicates
  const cleanedEmail = email.trim().toLowerCase();
  if (subscribers.some((s) => s.email === cleanedEmail)) {
    return res
      .status(409)
      .json({ error: 'This email is already subscribed.' });
  }

  const subscriber = {
    id: subscribers.length + 1,
    email: cleanedEmail,
    name: name ? name.trim() : '',
    subscribedAt: new Date().toISOString(),
  };
  subscribers.push(subscriber);

  res.status(201).json({
    message: "You're in! Check your inbox for travel inspiration.",
    subscriber,
  });
});

// GET /api/newsletter — list subscribers (for testing/admin)
router.get('/', (_req, res) => {
  res.json(subscribers);
});

module.exports = router;
