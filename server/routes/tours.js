import express from "express";
import fs from "fs";
import path from "path";
import { requireAuth } from "../middleware/auth.js";
import { fileURLToPath } from 'url'

const router = express.Router();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'tours.json'), 'utf-8')
);
// GET /api/tours  — optional ?category= filter
router.get('/', requireAuth, (req, res) => {
  const { category } = req.query;
  let results = [...tours];
  if (category && category !== 'all') {
    results = results.filter(
      (t) => t.category.toLowerCase() === category.toLowerCase()
    );
  }
  res.json(results);
});

// GET /api/tours/:id
router.get('/:id', requireAuth, (req, res) => {
  const tour = tours.find((t) => t.id === Number(req.params.id));
  if (!tour) return res.status(404).json({ error: 'Tour not found' });
  res.json(tour);
});

export default router;
