// routes/tours.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'tours.json'), 'utf-8')
);

// GET /api/tours  — optional ?category= filter
router.get('/', (req, res) => {
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
router.get('/:id', (req, res) => {
  const tour = tours.find((t) => t.id === Number(req.params.id));
  if (!tour) return res.status(404).json({ error: 'Tour not found' });
  res.json(tour);
});

module.exports = router;
