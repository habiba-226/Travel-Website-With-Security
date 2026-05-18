// routes/posts.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const router = express.Router();
const posts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'posts.json'), 'utf-8')
);

// GET /api/posts  — optional ?search= and ?category= filters
router.get('/', (req, res) => {
  const { search, category } = req.query;
  let results = [...posts];

  if (category && category !== 'all') {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json(results);
});

// GET /api/posts/:id
router.get('/:id', (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

export default router;
