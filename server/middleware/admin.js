



function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Please log in' });
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
}