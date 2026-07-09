const express = require('express');
const { verifyToken, verifyEnseignant, verifyAdmin, optionalAuth } = require('../middleware/auth');
const pool = require('../database/db');
const router = express.Router();
const socketHelper = require('../socket');

async function getTableColumns(tableName) {
  const [cols] = await pool.query(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [require('../config').db.database, tableName]
  );
  return cols.map((c) => c.COLUMN_NAME);
}

// List recent evaluations
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ev.idEval, ev.matricule, ev.note, ev.appreciation, ev.created_at,
        c.libelle AS cours, e.nom, e.prenom, s.libelle AS salle
      FROM Evaluation ev
      LEFT JOIN Cours c ON c.idCours = ev.idCours
      LEFT JOIN Eleve e ON e.matricule = ev.matricule
      LEFT JOIN Salle s ON s.idSalle = c.idSalle
      ORDER BY ev.created_at DESC LIMIT 500
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create evaluation - allow both enseignant and admin
const canCreateEvaluation = (req, res, next) => {
  verifyToken(req, res, () => {
    const role = req.user?.role || '';
    if (role !== 'enseignant' && role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({ error: 'Accès réservé' });
    }
    next();
  });
};

router.post('/', canCreateEvaluation, async (req, res) => {
  try {
    const { matricule, idCours, note, appreciation, idEpreuve, idSession, idPers } = req.body;
    
    if (!matricule) {
      return res.status(400).json({ error: 'Matricule requis' });
    }

    // Resolve idCours from payload or teacher context
    let finalIdCours = idCours;
    if (!finalIdCours && req.user?.role === 'enseignant') {
      finalIdCours = req.user.idCours || null;
      if (!finalIdCours) {
        const idPersonne = req.user.id || req.user.idPers || null;
        if (idPersonne) {
          const [teacherRows] = await pool.query(
            'SELECT idCours FROM Enseignant WHERE idPers = ? LIMIT 1',
            [idPersonne]
          );
          finalIdCours = teacherRows.length > 0 ? teacherRows[0].idCours : null;
        }
      }
    }

    if (!finalIdCours) {
      return res.status(400).json({ error: 'Impossible de déterminer le cours (idCours manquant)' });
    }

    const parsedNote = Number(note);
    if (Number.isNaN(parsedNote) || parsedNote < 0 || parsedNote > 20) {
      return res.status(400).json({ error: 'La note doit être un nombre entre 0 et 20' });
    }

    const idAdmin = req.user?.id || 1000;
    const cols = await getTableColumns('Evaluation');
    
    // Build dynamic insert with proper ordering and optional fields
    const insertCols = [];
    const placeholders = [];
    const values = [];
    
    const addIf = (name, val) => {
      if (cols.includes(name) && val !== undefined && val !== null) {
        insertCols.push(name);
        placeholders.push('?');
        values.push(val);
      }
    };
    
    // Required fields
    addIf('matricule', matricule);
    addIf('idCours', finalIdCours);
    addIf('note', parsedNote);
    
    // Optional fields
    addIf('appreciation', appreciation || null);
    addIf('idAdmin', idAdmin);
    addIf('idEpreuve', idEpreuve || null);
    addIf('idSession', idSession || null);
    addIf('idPers', idPers || null);
    
    // Timestamp
    if (cols.includes('created_at')) {
      insertCols.push('created_at');
      placeholders.push('NOW()');
    }
    
    if (insertCols.length === 0) {
      return res.status(500).json({ error: 'Aucune colonne reconnue pour Evaluation' });
    }
    
    const sql = `INSERT INTO Evaluation (${insertCols.join(',')}) VALUES (${placeholders.join(',')})`;
    const [result] = await pool.query(sql, values);
    const [rows] = await pool.query('SELECT * FROM Evaluation WHERE idEval = ?', [result.insertId]);
    
    try {
      const io = socketHelper.get();
      // Notify the student room and any listeners
      io.to(`student-${matricule}`).emit('evaluation:created', rows[0]);
      io.emit('evaluation:created:global', { matricule, idEval: rows[0].idEval });
    } catch (e) { /* ignore socket errors */ }
    
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
