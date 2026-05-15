// routes/gallery.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const gallery = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'gallery.json'), 'utf-8')
);

// GET /api/gallery  — optional ?category= filter
router.get('/', (req, res) => {
  const { category } = req.query;
  let results = [...gallery];
  if (category && category !== 'all') {
    results = results.filter(
      (g) => g.category.toLowerCase() === category.toLowerCase()
    );
  }
  res.json(results);
});

module.exports = router;
