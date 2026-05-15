// routes/gallery.js
import express from "express";
import fs from "fs";
import path from "path";
import { requireAuth } from "../middleware/auth.js";
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router();
const gallery = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'gallery.json'), 'utf-8')
);

// GET /api/gallery  — optional ?category= filter
router.get('/', requireAuth, (req, res) => {
  const { category } = req.query;
  let results = [...gallery];
  if (category && category !== 'all') {
    results = results.filter(
      (g) => g.category.toLowerCase() === category.toLowerCase()
    );
  }
  res.json(results);
});

export default router;
