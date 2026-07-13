const pool = require('../database/db');
const { logAction } = require('../utils/audit');

// GET ALL INSCRIPTIONS
exports.getInscriptions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        f.idFrequente, f.matricule, f.idClasse, f.idAcademi,
        e.nom AS eleveNom, e.prenom AS elevePrenom,
        c.libelle AS classe,
        s.libelle AS salle,
        a.libelle AS annee
      FROM Frequente f
      JOIN Eleve e ON e.matricule = f.matricule
      JOIN Classe c ON c.idClasse = f.idClasse
      LEFT JOIN Salle s ON s.idSalle = c.idSalle
      JOIN AnneeAcademique a ON a.idAnnee = f.idAcademi
      ORDER BY a.libelle DESC, e.nom ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET INSCRIPTION BY ID
exports.getInscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        f.idFrequente, f.matricule, f.idClasse, f.idAcademi,
        e.nom AS eleveNom, e.prenom AS elevePrenom,
        c.libelle AS classe,
        s.libelle AS salle,
        a.libelle AS annee, a.periode
      FROM Frequente f
      JOIN Eleve e ON e.matricule = f.matricule
      JOIN Classe c ON c.idClasse = f.idClasse
      LEFT JOIN Salle s ON s.idSalle = c.idSalle
      JOIN AnneeAcademique a ON a.idAnnee = f.idAcademi
      WHERE f.idFrequente = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Inscription non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE INSCRIPTION
exports.createInscription = async (req, res) => {
  try {
    const { matricule, idClasse, idAcademi, commentaire } = req.body;
    if (!matricule || !idClasse || !idAcademi) {
      return res.status(400).json({ error: 'matricule, idClasse, idAcademi requis' });
    }

    const idAdmin = req.user?.id || 1;

    const [result] = await pool.query(
      `INSERT INTO Frequente (matricule, idClasse, idAcademi, commentaire, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [matricule, idClasse, idAcademi, commentaire || '', idAdmin]
    );

    const [rows] = await pool.query(`
      SELECT 
        f.idFrequente, f.matricule, f.idClasse, f.idAcademi,
        e.nom AS eleveNom, e.prenom AS elevePrenom,
        c.libelle AS classe,
        s.libelle AS salle,
        a.libelle AS annee
      FROM Frequente f
      JOIN Eleve e ON e.matricule = f.matricule
      JOIN Classe c ON c.idClasse = f.idClasse
      LEFT JOIN Salle s ON s.idSalle = c.idSalle
      JOIN AnneeAcademique a ON a.idAnnee = f.idAcademi
      WHERE f.idFrequente = ?
    `, [result.insertId]);

    res.status(201).json(rows[0]);
    try { await logAction(req.user, 'create', 'Inscription', result.insertId, JSON.stringify(rows[0])); } catch (e) {}
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE INSCRIPTION
exports.updateInscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { idClasse, idAcademi, commentaire } = req.body;

    await pool.query(
      `UPDATE Frequente SET idClasse=?, idAcademi=?, commentaire=? WHERE idFrequente=?`,
      [idClasse, idAcademi, commentaire || '', id]
    );

    const [rows] = await pool.query(`
      SELECT 
        f.idFrequente, f.matricule, f.idClasse, f.idAcademi,
        e.nom AS eleveNom, e.prenom AS elevePrenom,
        c.libelle AS classe,
        s.libelle AS salle,
        a.libelle AS annee
      FROM Frequente f
      JOIN Eleve e ON e.matricule = f.matricule
      JOIN Classe c ON c.idClasse = f.idClasse
      LEFT JOIN Salle s ON s.idSalle = c.idSalle
      JOIN AnneeAcademique a ON a.idAnnee = f.idAcademi
      WHERE f.idFrequente = ?
    `, [id]);

    res.json(rows[0]);
    try { await logAction(req.user, 'update', 'Inscription', id, JSON.stringify(rows[0])); } catch (e) {}
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE INSCRIPTION
exports.deleteInscription = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Frequente WHERE idFrequente = ?', [id]);
    res.json({ message: 'Inscription supprimée' });
    try { await logAction(req.user, 'delete', 'Inscription', id, null); } catch (e) {}
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET INSCRIPTIONS BY ELEVE
exports.getInscriptionsByEleve = async (req, res) => {
  try {
    const { matricule } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        f.idFrequente, f.matricule, f.idClasse, f.idAcademi,
        c.libelle AS classe,
        s.libelle AS salle,
        a.libelle AS annee, a.periode
      FROM Frequente f
      JOIN Classe c ON c.idClasse = f.idClasse
      LEFT JOIN Salle s ON s.idSalle = c.idSalle
      JOIN AnneeAcademique a ON a.idAnnee = f.idAcademi
      WHERE f.matricule = ?
      ORDER BY a.libelle DESC
    `, [matricule]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
