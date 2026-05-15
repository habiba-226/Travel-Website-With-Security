// routes/destinations.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Load destinations from JSON file (acts as our database)
const dataPath = path.join(__dirname, '..', 'data', 'destinations.json');
const destinations = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// GET /api/destinations  — list all (with optional ?continent= and ?search= filters)
router.get('/', (req, res) => {
  const { continent, search, maxPrice } = req.query;
  let results = [...destinations];

  if (continent && continent !== 'all') {
    results = results.filter(
      (d) => d.continent.toLowerCase() === continent.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  }

  if (maxPrice) {
    results = results.filter((d) => d.price <= Number(maxPrice));
  }

  res.json(results);
});

// GET /api/destinations/:id — single destination
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const dest = destinations.find((d) => d.id === id);
  if (!dest) return res.status(404).json({ error: 'Destination not found' });
  res.json(dest);
});

module.exports = router;
