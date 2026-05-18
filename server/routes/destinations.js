// routes/destinations.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url'


const router = express.Router();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataPath = path.join(__dirname, '..', 'data', 'destinations.json');
const destinations = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// GET /api/destinations  — list all (with optional ?continent= and ?search= filters)
router.get('/', (req, res) => {

  console.log("Loading destinations from file...");
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

export default router;
