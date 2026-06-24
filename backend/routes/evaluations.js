const express = require('express');
const { verifyEnseignant } = require('../middleware/auth');
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
router.get('/', verifyEnseignant, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ev.idEval, ev.matricule, ev.note, ev.appreciation, ev.created_at,
        c.libelle AS cours, e.nom, e.prenom
      FROM Evaluation ev
      LEFT JOIN Cours c ON c.idCours = ev.idCours
      LEFT JOIN Eleve e ON e.matricule = ev.matricule
      ORDER BY ev.created_at DESC LIMIT 500
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create evaluation
router.post('/', verifyEnseignant, async (req, res) => {
  try {
    const { matricule, idCours, note, appreciation } = req.body;
    if (!matricule || !idCours) return res.status(400).json({ error: 'Matricule et idCours requis' });

    const parsedNote = Number(note);
    if (Number.isNaN(parsedNote) || parsedNote < 0 || parsedNote > 20) {
      return res.status(400).json({ error: 'La note doit être un nombre entre 0 et 20' });
    }

    const idAdmin = req.user?.id || 1000;
    const cols = await getTableColumns('Evaluation');
    const insertCols = [];
    const placeholders = [];
    const values = [];
    const addIf = (name, val) => { if (cols.includes(name)) { insertCols.push(name); placeholders.push('?'); values.push(val); } };
    addIf('matricule', matricule);
    addIf('idCours', idCours);
    addIf('note', parsedNote);
    addIf('appreciation', appreciation || '');
    addIf('idAdmin', idAdmin);
    if (cols.includes('created_at')) { insertCols.push('created_at'); placeholders.push('NOW()'); }
    if (insertCols.length === 0) return res.status(500).json({ error: 'Aucune colonne reconnue pour Evaluation' });
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
