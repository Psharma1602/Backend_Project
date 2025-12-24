const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // { id, role }
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ error: 'Access denied' });
    next();
  };
}

module.exports = { authenticate, authorizeRole };