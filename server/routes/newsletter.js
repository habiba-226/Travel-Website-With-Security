// routes/newsletter.js
import express from "express";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// POST /api/newsletter — subscribe to newsletter
router.post('/', async (req, res) => {
  const { email, name } = req.body || {};

  const errors = {};
  if (!email || !isEmail(email)) errors.email = 'A valid email is required';
  if (name && name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors });
  }

  const cleanedEmail = email.trim().toLowerCase();

  try {
    const subscriber = await prisma.subscriber.create({
      data: {
        email: cleanedEmail,
        name: name ? name.trim() : '',
      },
    });

    res.status(201).json({
      message: "You're in! Check your inbox for travel inspiration.",
      subscriber,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'This email is already subscribed.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// GET /api/newsletter — list subscribers
router.get('/', async (_req, res) => {
  const subscribers = await prisma.subscriber.findMany({ orderBy: { subscribedAt: 'desc' } });
  res.json(subscribers);
});

export default router;
