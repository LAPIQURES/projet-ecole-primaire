const express = require('express');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');
const pool = require('../database/db');

const router = express.Router();

async function getColumns(tableName) {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?`,
    [tableName]
  );
  return new Set(rows.map((r) => r.COLUMN_NAME));
}

async function ensureCoursColumns() {
  const cols = await getColumns('Cours');

  const alters = [];
  if (!cols.has('idClasse')) alters.push('ADD COLUMN idClasse INT NULL');
  if (!cols.has('idEnseignant')) alters.push('ADD COLUMN idEnseignant INT NULL');
  if (!cols.has('heures')) alters.push('ADD COLUMN heures INT NULL');
  if (!cols.has('idSalle')) alters.push('ADD COLUMN idSalle INT NULL');

  if (alters.length) {
    await pool.query(`ALTER TABLE Cours ${alters.join(', ')}`);
  }
}

router.get('/', verifyToken, async (req, res) => {
  try {
    await ensureCoursColumns();

    const { idClasse } = req.query;
    const params = [];
    let where = 'WHERE (c.actif IS NULL OR c.actif = 1)';

    if (idClasse) {
      where += ' AND c.idClasse = ?';
      params.push(idClasse);
    }

    // Nb élèves par classe (via salles + fréquente)
    const [rows] = await pool.query(
      `SELECT
         c.idCours,
         c.libelle,
         c.idClasse,
         c.idEnseignant,
         c.heures,
         c.idSalle,
         cl.libelle AS classe,
         s.libelle AS salle,
         COALESCE(CONCAT(p.prenom, ' ', p.nom), CONCAT(p.nom, ' ', p.prenom)) AS enseignant,
         COALESCE(nb.nbEleves, 0) AS nbEleves
       FROM Cours c
       LEFT JOIN Classe cl ON cl.idClasse = c.idClasse
       LEFT JOIN Salle s ON s.idSalle = c.idSalle
       LEFT JOIN Enseignant en ON (en.idEnseignant = c.idEnseignant) OR (en.idCours = c.idCours)
       LEFT JOIN Personne p ON p.idPers = en.idPers
       LEFT JOIN (
         SELECT f.idClasse, COUNT(DISTINCT f.matricule) AS nbEleves
         FROM Frequente f
         GROUP BY f.idClasse
       ) nb ON nb.idClasse = c.idClasse
       ${where}
       ORDER BY c.libelle`,
      params
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    await ensureCoursColumns();

    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT
         c.idCours,
         c.libelle,
         c.idClasse,
         c.idEnseignant,
         c.heures,
         c.idSalle,
         cl.libelle AS classe,
         s.libelle AS salle,
         COALESCE(CONCAT(p.prenom, ' ', p.nom), CONCAT(p.nom, ' ', p.prenom)) AS enseignant,
         COALESCE(nb.nbEleves, 0) AS nbEleves
       FROM Cours c
       LEFT JOIN Classe cl ON cl.idClasse = c.idClasse
       LEFT JOIN Salle s ON s.idSalle = c.idSalle
       LEFT JOIN Enseignant en ON (en.idEnseignant = c.idEnseignant) OR (en.idCours = c.idCours)
       LEFT JOIN Personne p ON p.idPers = en.idPers
       LEFT JOIN (
         SELECT s2.idClasse, COUNT(DISTINCT f.matricule) AS nbEleves
         FROM Salle s2
         LEFT JOIN Frequente f ON f.idClasse = s2.idClasse
         GROUP BY s2.idClasse
       ) nb ON nb.idClasse = c.idClasse
       WHERE c.idCours = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Cours non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    await ensureCoursColumns();

    const { libelle, idClasse, idEnseignant, heures, idSalle } = req.body;
    if (!libelle || !idClasse) return res.status(400).json({ error: 'libelle et idClasse requis' });

    const cols = await getColumns('Cours');

    const fields = ['libelle'];
    const placeholders = ['?'];
    const values = [libelle];

    if (cols.has('idClasse')) { fields.push('idClasse'); placeholders.push('?'); values.push(idClasse); }
    if (cols.has('idEnseignant')) { fields.push('idEnseignant'); placeholders.push('?'); values.push(idEnseignant || null); }
    if (cols.has('heures')) { fields.push('heures'); placeholders.push('?'); values.push(heures ?? null); }
    if (cols.has('idSalle')) { fields.push('idSalle'); placeholders.push('?'); values.push(idSalle || null); }

    if (cols.has('actif')) { fields.push('actif'); placeholders.push('?'); values.push(1); }
    if (cols.has('idAdmin')) { fields.push('idAdmin'); placeholders.push('?'); values.push(req.user?.id || null); }
    if (cols.has('created_at')) { fields.push('created_at'); placeholders.push('?'); values.push(new Date()); }

    const [result] = await pool.query(
      `INSERT INTO Cours (${fields.join(',')}) VALUES (${placeholders.join(',')})`,
      values
    );

    const [rows] = await pool.query('SELECT idCours, libelle, idClasse, idEnseignant, heures, idSalle, actif FROM Cours WHERE idCours = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    await ensureCoursColumns();

    const { id } = req.params;
    const { libelle, idClasse, idEnseignant, heures, idSalle, actif } = req.body;

    const cols = await getColumns('Cours');

    const updates = [];
    const values = [];

    if (libelle !== undefined) { updates.push('libelle = ?'); values.push(libelle); }
    if (cols.has('idClasse') && idClasse !== undefined) { updates.push('idClasse = ?'); values.push(idClasse || null); }
    if (cols.has('idEnseignant') && idEnseignant !== undefined) { updates.push('idEnseignant = ?'); values.push(idEnseignant || null); }
    if (cols.has('heures') && heures !== undefined) { updates.push('heures = ?'); values.push(heures ?? null); }
    if (cols.has('idSalle') && idSalle !== undefined) { updates.push('idSalle = ?'); values.push(idSalle || null); }
    if (cols.has('actif') && actif !== undefined) { updates.push('actif = ?'); values.push(actif); }

    if (!updates.length) return res.status(400).json({ error: 'Aucun champ à modifier' });

    values.push(id);
    await pool.query(`UPDATE Cours SET ${updates.join(', ')} WHERE idCours = ?`, values);

    const [rows] = await pool.query('SELECT idCours, libelle, idClasse, idEnseignant, heures, idSalle, actif FROM Cours WHERE idCours = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const cols = await getColumns('Cours');

    if (cols.has('actif')) {
      await pool.query('UPDATE Cours SET actif = 0 WHERE idCours = ?', [id]);
      res.json({ message: 'Cours désactivé' });
    } else {
      await pool.query('DELETE FROM Cours WHERE idCours = ?', [id]);
      res.json({ message: 'Cours supprimé' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
