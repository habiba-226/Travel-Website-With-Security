// routes/posts.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const posts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'posts.json'), 'utf-8')
);

// GET /api/posts  — optional ?search= and ?category= filters
// NOTE: search is currently done in JS (safe).
// When the SQLite migration happens, this is where the vulnerable
// string-concatenated query will live (for the security demo).
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

module.exports = router;
