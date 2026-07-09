const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../database/db');

// Base token verification middleware
function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    // (debug logs removed)
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Token manquant' });
    const token = header.split(' ')[1];

    // Development short-circuit: dev:role:id
    if (process.env.NODE_ENV !== 'production' && token && token.startsWith('dev:')) {
      const parts = token.split(':');
      req.user = { id: Number(parts[2]) || 1, role: parts[1] || 'admin' };
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    // (debug logs removed)
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// Factory: verify that user role is allowed (accepts array or single role)
function verifyAdmin(reqOrRoles, res, next) {
  // If used directly as middleware: verifyAdmin(req, res, next)
  if (reqOrRoles && reqOrRoles.method) {
    const req = reqOrRoles;
    return verifyToken(req, res, () => {
      const role = req.user?.role;
      if (!role) return res.status(403).json({ error: 'Rôle manquant' });
      if (['admin', 'superadmin', 'directeur', 'intendant'].includes(role)) return next();
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    });
  }

  // If used as a factory: verifyAdmin(['role1', 'role2'])
  const allowedRoles = reqOrRoles || ['admin', 'superadmin'];
  return (req, res, next) => verifyToken(req, res, () => {
    const role = req.user?.role;
    if (!role) return res.status(403).json({ error: 'Rôle manquant' });
    if (['admin', 'superadmin'].includes(role)) return next();
    if (Array.isArray(allowedRoles) && allowedRoles.includes(role)) return next();
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  });
}

// Verify enseignant with active flag
async function verifyEnseignant(req, res, next) {
  return verifyToken(req, res, async () => {
    try {
      const role = req.user?.role;
      if (role !== 'enseignant') return res.status(403).json({ error: 'Accès réservé aux enseignants' });
      const idPers = Number(req.user.id || req.user.idPers);
      if (!idPers) return res.status(401).json({ error: 'Token invalide (id manquant)' });
      const [rows] = await pool.query('SELECT idEnseignant, idCours, Actif FROM Enseignant WHERE idPers = ? LIMIT 1', [idPers]);
      if (!rows || rows.length === 0) return res.status(403).json({ error: 'Compte enseignant introuvable' });
      const ens = rows[0];
      if (!ens.Actif || Number(ens.Actif) === 0) return res.status(403).json({ error: 'Compte désactivé' });
      req.user.idEnseignant = ens.idEnseignant;
      if (ens.idCours) req.user.idCours = ens.idCours;
      return next();
    } catch (err) {
      console.error('verifyEnseignant error:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  });
}

// Optional auth: if token present validate, else continue with null user
function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header) { req.user = null; return next(); }
    const token = header.split(' ')[1];
    if (process.env.NODE_ENV !== 'production' && token && token.startsWith('dev:')) {
      const parts = token.split(':'); req.user = { id: Number(parts[2]) || 1, role: parts[1] || 'admin' }; return next();
    }
    req.user = jwt.verify(token, config.jwt.secret);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// Export verifyToken as the default middleware function for legacy imports,
// and also expose helpers as properties for explicit imports.
const authMiddleware = verifyToken;
authMiddleware.verifyToken = verifyToken;
authMiddleware.verifyAdmin = verifyAdmin;
authMiddleware.verifyEnseignant = verifyEnseignant;
authMiddleware.optionalAuth = optionalAuth;

module.exports = authMiddleware;
