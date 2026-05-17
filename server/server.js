require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const session = require('express-session');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'wanderly-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// ---------- Middleware ----------

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Please log in' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Please log in' });
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
}

// ---------- Auth Routes ----------

// VULNERABILITY: raw string interpolation → SQL Injection
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE email='${email}' AND password='${password}'`
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (err) {
    // VULNERABILITY: SQL error message exposed to client
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, password, 'user']
    );
    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch {
    res.status(400).json({ error: 'That email is already registered' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.json({ message: 'Logged out' });
});

app.get('/api/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, username, email, role FROM users WHERE id=$1',
    [req.session.userId]
  );
  res.json(result.rows[0] || null);
});

// ---------- Destinations ----------

// VULNERABILITY: search param is string-interpolated → SQL Injection
app.get('/api/destinations', requireAuth, async (req, res) => {
  const { search } = req.query;
  try {
    let query = 'SELECT * FROM destinations';
    if (search && search.trim()) {
      query = `SELECT * FROM destinations WHERE name ILIKE '%${search}%' OR country ILIKE '%${search}%'`;
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    // VULNERABILITY: exposes SQL error details
    res.status(500).json({ error: err.message });
  }
});

// ---------- Blog Posts ----------

app.get('/api/posts', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
  res.json(result.rows);
});

app.get('/api/posts/:id/comments', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM comments WHERE post_id=$1 ORDER BY created_at ASC',
    [req.params.id]
  );
  res.json(result.rows);
});

// VULNERABILITY: comment body stored raw, no sanitization → Stored XSS
app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
  await pool.query(
    'INSERT INTO comments (post_id, username, body) VALUES ($1, $2, $3)',
    [req.params.id, req.session.username, body]
  );
  res.status(201).json({ message: 'Comment added' });
});

// ---------- Admin / Privilege Escalation (CSRF target) ----------

app.get('/api/users', requireAdmin, async (req, res) => {
  const result = await pool.query(
    'SELECT id, username, email, role FROM users ORDER BY id'
  );
  res.json(result.rows);
});

// VULNERABILITY: no CSRF token → CSRF via XSS possible
app.post('/api/promote/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;
  await pool.query('UPDATE users SET role=$1 WHERE id=$2', ['admin', userId]);
  res.json({ message: `User ${userId} promoted to admin` });
});

app.get('/api/comments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM comments ORDER BY id DESC'
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load comments' });
  }
});
app.post('/api/comments', async (req, res) => {
  try {
    const { content } = req.body;

    await pool.query(
      'INSERT INTO comments (content) VALUES ($1)',
      [content]
    );

    res.json({ message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});
// ---------- Start ----------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
