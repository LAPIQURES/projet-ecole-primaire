const jwt = require('jsonwebtoken');
const config = require('../config');

// Authentication middleware
// Supports two modes for local development:
// 1) Real JWT signed with config.jwt.secret
// 2) Dev token prefix `dev:role:id` (only when NODE_ENV !== 'production')
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    // Development bypass: allow tokens like `dev:enseignant:1`
    if (process.env.NODE_ENV !== 'production' && token.startsWith('dev:')) {
      const parts = token.split(':');
      const role = parts[1] || 'admin';
      const id = parts[2] ? Number(parts[2]) : 1;
      req.user = { id, role };
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports = auth;
module.exports.verifyToken = auth;

// Verify admin role
const verifyAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
  });
};

module.exports.verifyAdmin = verifyAdmin;
