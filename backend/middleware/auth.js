const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../database/db');

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
module.exports.auth = auth;
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

// Verify enseignant role and active flag
const verifyEnseignant = (req, res, next) => {
  auth(req, res, async () => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Token manquant' });
      const role = req.user.role || req.user.type || '';
      if (role !== 'enseignant') return res.status(403).json({ error: 'Accès réservé aux enseignants' });

      const idPers = req.user.id || req.user.idPers || null;
      const persId = Number(idPers) || null;
      if (!persId) return res.status(401).json({ error: 'Token invalide (idPers manquant)' });

      const [rows] = await pool.query('SELECT e.idEnseignant, e.idCours, e.Actif FROM Enseignant e WHERE e.idPers = ? LIMIT 1', [persId]);
      if (!rows || rows.length === 0) return res.status(403).json({ error: 'Compte enseignant introuvable' });
      const enseignant = rows[0];
      if (!enseignant.Actif || Number(enseignant.Actif) === 0) return res.status(403).json({ error: 'Compte désactivé' });

      req.user.idEnseignant = enseignant.idEnseignant;
      if (enseignant.idCours !== undefined && enseignant.idCours !== null) {
        req.user.idCours = enseignant.idCours;
      }
      next();
    } catch (err) {
      console.error('verifyEnseignant error:', err && err.message ? err.message : err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
};

module.exports.verifyEnseignant = verifyEnseignant;

// Optional auth: if token present, validate and set req.user; if absent, continue anonymously
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

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
    // If token present but invalid, return 401
    return res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports.optionalAuth = optionalAuth;
