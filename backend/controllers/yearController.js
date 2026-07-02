const pool = require('../database/db');

// GET ALL ANNEES ACADEMIQUES
exports.getAnnees = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM AnneeAcademique
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ANNEE BY ID
exports.getAnneeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM AnneeAcademique WHERE idAnnee = ?', [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Année non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE ANNEE
exports.createAnnee = async (req, res) => {
  try {
    const { libelle, periode } = req.body;
    if (!libelle) return res.status(400).json({ error: 'Libelle requis' });

    const idAdmin = req.user?.id || 1;
    const [result] = await pool.query(
      `INSERT INTO AnneeAcademique (libelle, periode, idAdmin, created_at)
       VALUES (?, ?, ?, NOW())`,
      [libelle, periode || '', idAdmin]
    );

    const [rows] = await pool.query('SELECT * FROM AnneeAcademique WHERE idAnnee = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE ANNEE
exports.updateAnnee = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, periode } = req.body;

    await pool.query(
      'UPDATE AnneeAcademique SET libelle=?, periode=? WHERE idAnnee=?',
      [libelle, periode || '', id]
    );

    const [rows] = await pool.query('SELECT * FROM AnneeAcademique WHERE idAnnee = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Année non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE ANNEE
exports.deleteAnnee = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM AnneeAcademique WHERE idAnnee = ?', [id]);
    res.json({ message: 'Année supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL TRIMESTRES
exports.getTrimestres = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.idTrimes, t.libelle, t.periode, t.idAca,
        a.libelle AS anneeLibelle
      FROM Trimestre t
      JOIN AnneeAcademique a ON a.idAnnee = t.idAca
      ORDER BY t.idAca DESC, t.idTrimes ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET TRIMESTRE BY ID
exports.getTrimestresById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        t.idTrimes, t.libelle, t.periode, t.idAca,
        a.libelle AS anneeLibelle
      FROM Trimestre t
      JOIN AnneeAcademique a ON a.idAnnee = t.idAca
      WHERE t.idTrimes = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Trimestre non trouvé' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE TRIMESTRE
exports.createTrimestre = async (req, res) => {
  try {
    const { libelle, periode, idAca } = req.body;
    if (!libelle || !idAca) return res.status(400).json({ error: 'Libelle et idAca requis' });

    const idAdmin = req.user?.id || 1;
    const [result] = await pool.query(
      `INSERT INTO Trimestre (libelle, periode, idAca, idAdmin, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [libelle, periode || '', idAca, idAdmin]
    );

    const [rows] = await pool.query(`
      SELECT 
        t.idTrimes, t.libelle, t.periode, t.idAca,
        a.libelle AS anneeLibelle
      FROM Trimestre t
      JOIN AnneeAcademique a ON a.idAnnee = t.idAca
      WHERE t.idTrimes = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE TRIMESTRE
exports.updateTrimestre = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, periode } = req.body;

    await pool.query(
      'UPDATE Trimestre SET libelle=?, periode=? WHERE idTrimes=?',
      [libelle, periode || '', id]
    );

    const [rows] = await pool.query(`
      SELECT 
        t.idTrimes, t.libelle, t.periode, t.idAca,
        a.libelle AS anneeLibelle
      FROM Trimestre t
      JOIN AnneeAcademique a ON a.idAnnee = t.idAca
      WHERE t.idTrimes = ?
    `, [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE TRIMESTRE
exports.deleteTrimestre = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Trimestre WHERE idTrimes = ?', [id]);
    res.json({ message: 'Trimestre supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
