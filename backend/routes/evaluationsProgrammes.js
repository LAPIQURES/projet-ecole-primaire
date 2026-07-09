const express = require('express');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');
const pool = require('../database/db');

const router = express.Router();

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS EvaluationProgramme (
      id INT AUTO_INCREMENT PRIMARY KEY,
      libelle VARCHAR(255) NOT NULL,
      type VARCHAR(60) NULL,
      date DATE NULL,
      duree INT NULL,
      coeff DECIMAL(8,2) NULL,
      classe INT NULL,
      cours_id INT NULL,
      idSalle INT NULL,
      enseignant_id INT NULL,
      note_max DECIMAL(8,2) NOT NULL DEFAULT 20,
      description TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [cols] = await pool.query(`
    SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'EvaluationProgramme'
  `);
  const set = new Set(cols.map((row) => row.COLUMN_NAME));
  if (!set.has('idSalle')) {
    await pool.query('ALTER TABLE EvaluationProgramme ADD COLUMN idSalle INT NULL AFTER cours_id');
  } else {
    const idSalleInfo = cols.find((row) => row.COLUMN_NAME === 'idSalle');
    if (idSalleInfo && idSalleInfo.IS_NULLABLE === 'NO') {
      await pool.query('ALTER TABLE EvaluationProgramme MODIFY COLUMN idSalle INT NULL');
    }
  }
}

router.get('/', verifyToken, async (req, res) => {
  try {
    await ensureTable();

    const { cours_id, classe } = req.query;
    const { idSalle } = req.query;
    const where = [];
    const params = [];

    if (cours_id) {
      where.push('cours_id = ?');
      params.push(cours_id);
    }
    if (classe) {
      where.push('classe = ?');
      params.push(classe);
    }
    if (idSalle) {
      where.push('idSalle = ?');
      params.push(idSalle);
    }

    // If multiple filters are provided, return evaluations matching ANY of them
    const w = where.length ? `WHERE ${where.join(' OR ')}` : '';

    const [rows] = await pool.query(
      `SELECT id, libelle, type, date, duree, coeff, classe, cours_id, idSalle, enseignant_id, note_max, description, created_at, updated_at
       FROM EvaluationProgramme
       ${w}
       ORDER BY date IS NULL, date DESC, created_at DESC
       LIMIT 500`,
      params
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.query(
      'SELECT id, libelle, type, date, duree, coeff, classe, cours_id, idSalle, enseignant_id, note_max, description, created_at, updated_at FROM EvaluationProgramme WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Évaluation non trouvée' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    await ensureTable();

    const {
      libelle,
      type,
      date,
      duree,
      coeff,
      classe,
      cours_id,
      idSalle,
      enseignant_id,
      scope,
      note_max = 20,
      description,
    } = req.body;

    if (!libelle) return res.status(400).json({ error: 'libelle requis' });
    if (!cours_id && !idSalle && classe == null) return res.status(400).json({ error: 'classe, cours_id ou idSalle requis' });

    const role = String(req.user?.role || '').toLowerCase();
    const isAdmin = role === 'admin' || role === 'superadmin';
    const isTeacher = role === 'enseignant';
    const normalizedScope = scope === 'harmonisee' ? 'harmonisee' : 'sequentielle';

    let finalIdSalle = idSalle || null;
    if (isAdmin && normalizedScope === 'harmonisee') finalIdSalle = null;
    if (isTeacher) {
      if (!idSalle) return res.status(400).json({ error: 'Une évaluation séquentielle requiert une salle' });
    }

    if (isAdmin && normalizedScope === 'sequentielle' && !idSalle) {
      return res.status(400).json({ error: 'Une évaluation séquentielle requiert une salle' });
    }

    const [result] = await pool.query(
      `INSERT INTO EvaluationProgramme (libelle, type, date, duree, coeff, classe, cours_id, idSalle, enseignant_id, note_max, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        libelle,
        type || null,
        date || null,
        duree ?? null,
        coeff ?? null,
        classe ?? null,
        cours_id || null,
        finalIdSalle,
        enseignant_id ?? null,
        note_max ?? 20,
        description || '',
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, libelle, type, date, duree, coeff, classe, cours_id, idSalle, enseignant_id, note_max, description, created_at, updated_at FROM EvaluationProgramme WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    await ensureTable();

    const { id } = req.params;
    const {
      libelle,
      type,
      date,
      duree,
      coeff,
      classe,
      cours_id,
      idSalle,
      enseignant_id,
      scope,
      note_max,
      description,
    } = req.body;

    const role = String(req.user?.role || '').toLowerCase();
    const isAdmin = role === 'admin' || role === 'superadmin';
    const isTeacher = role === 'enseignant';
    const normalizedScope = scope === 'harmonisee' ? 'harmonisee' : 'sequentielle';

    let finalIdSalle = idSalle;
    if (isAdmin && normalizedScope === 'harmonisee') finalIdSalle = null;
    if (isTeacher && !idSalle) return res.status(400).json({ error: 'Une évaluation séquentielle requiert une salle' });
    if (isAdmin && normalizedScope === 'sequentielle' && !idSalle) return res.status(400).json({ error: 'Une évaluation séquentielle requiert une salle' });

    const updates = [];
    const params = [];

    if (libelle !== undefined) { updates.push('libelle = ?'); params.push(libelle); }
    if (type !== undefined) { updates.push('type = ?'); params.push(type || null); }
    if (date !== undefined) { updates.push('date = ?'); params.push(date || null); }
    if (duree !== undefined) { updates.push('duree = ?'); params.push(duree ?? null); }
    if (coeff !== undefined) { updates.push('coeff = ?'); params.push(coeff ?? null); }
    if (classe !== undefined) { updates.push('classe = ?'); params.push(classe ?? null); }
    if (cours_id !== undefined) { updates.push('cours_id = ?'); params.push(cours_id); }
    if (idSalle !== undefined) { updates.push('idSalle = ?'); params.push(finalIdSalle ?? null); }
    if (enseignant_id !== undefined) { updates.push('enseignant_id = ?'); params.push(enseignant_id ?? null); }
    if (note_max !== undefined) { updates.push('note_max = ?'); params.push(note_max ?? 20); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description || ''); }

    if (!updates.length) return res.status(400).json({ error: 'Aucun champ à modifier' });

    updates.push('updated_at = NOW()');

    params.push(id);
    await pool.query(`UPDATE EvaluationProgramme SET ${updates.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query(
      'SELECT id, libelle, type, date, duree, coeff, classe, cours_id, idSalle, enseignant_id, note_max, description, created_at, updated_at FROM EvaluationProgramme WHERE id = ?',
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await ensureTable();
    await pool.query('DELETE FROM EvaluationProgramme WHERE id = ?', [req.params.id]);
    res.json({ message: 'Évaluation supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
