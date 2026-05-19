
import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get('/api/users', requireAdmin, async (req, res) => {
  const result = await prisma.user.findMany({
    orderBy: { id: 'asc' }
  });
  res.json(result);
});

// VULNERABILITY: no CSRF token → CSRF via XSS possible
router.post('/api/promote/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'admin' }
  });
  res.json({ message: `User ${userId} promoted to admin` });
});

router.get('/api/comments', async (req, res) => {
  try {
    const result = await prisma.comment.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load comments' });
  }
});
router.post('/api/comments', async (req, res) => {
  try {
    const { content } = req.body;

    await prisma.comment.create({
      data: { content }
    });
      
    res.json({ message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});
