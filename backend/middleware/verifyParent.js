const pool = require('../database/db');

// Middleware to ensure a parent only accesses resources related to their child
// Usage: add to routes where 'matricule' is provided in body/query/params
module.exports = async function verifyParentAccess(req, res, next) {
  try {
    const user = req.user || {};
    if (!user || !user.role) return res.status(401).json({ error: 'Non authentifié' });
    if (user.role === 'admin' || user.role === 'superadmin') return next();

    if (user.role !== 'parent') return res.status(403).json({ error: 'Accès réservé aux parents' });

    const matricule = req.body?.matricule || req.query?.matricule || req.params?.matricule || null;
    if (!matricule) return res.status(400).json({ error: 'Matricule requis pour vérification' });

    const [rows] = await pool.query(
      `SELECT 1
       FROM ParentEleve pe
       JOIN Parents p ON p.idPers = pe.idPers
       WHERE p.idPers = ? AND pe.matricule = ?
       LIMIT 1`,
      [user.id, String(matricule)]
    );

    if (rows.length) return next();
    return res.status(403).json({ error: 'Parent non autorisé pour cet élève' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
