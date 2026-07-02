const pool = require('../database/db');

// GET ALL BUS (gestion bus scolaires)
exports.getBus = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM Bus
      ORDER BY libelle ASC
    `);
    res.json(rows);
  } catch (error) {
    // Si la table n'existe pas, retourner []
    res.json([]);
  }
};

// CREATE BUS
exports.createBus = async (req, res) => {
  try {
    const { libelle, capacite, chauffeur, plaqueImmatriculation } = req.body;
    if (!libelle) return res.status(400).json({ error: 'Libelle requis' });

    const idAdmin = req.user?.id || 1;
    const [result] = await pool.query(
      `INSERT INTO Bus (libelle, capacite, chauffeur, plaqueImmatriculation, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [libelle, capacite || 50, chauffeur || '', plaqueImmatriculation || '', idAdmin]
    );

    const [rows] = await pool.query('SELECT * FROM Bus WHERE idBus = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE BUS
exports.updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, capacite, chauffeur, plaqueImmatriculation } = req.body;
    if (!libelle) return res.status(400).json({ error: 'Libelle requis' });

    await pool.query(
      `UPDATE Bus SET libelle = ?, capacite = ?, chauffeur = ?, plaqueImmatriculation = ? WHERE idBus = ?`,
      [libelle, capacite || 50, chauffeur || '', plaqueImmatriculation || '', id]
    );

    const [rows] = await pool.query('SELECT * FROM Bus WHERE idBus = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL ABONNEMENTS BUS
exports.getAbonnementsBus = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ab.idAbonnement, ab.matricule, ab.idBus, ab.dateDebut, ab.dateFin, ab.tarif, ab.statut,
        e.nom AS eleveNom, e.prenom AS elevePrenom,
        b.libelle AS busLibelle
      FROM AbonnementBus ab
      JOIN Eleve e ON e.matricule = ab.matricule
      JOIN Bus b ON b.idBus = ab.idBus
      ORDER BY ab.dateDebut DESC
    `);
    res.json(rows);
  } catch (error) {
    // Si table n'existe pas
    res.json([]);
  }
};

// CREATE ABONNEMENT BUS
exports.createAbonnementBus = async (req, res) => {
  try {
    const { matricule, idBus, dateDebut, dateFin, tarif } = req.body;
    if (!matricule || !idBus) return res.status(400).json({ error: 'matricule et idBus requis' });

    const idAdmin = req.user?.id || 1;
    const [result] = await pool.query(
      `INSERT INTO AbonnementBus (matricule, idBus, dateDebut, dateFin, tarif, statut, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, 'ACTIF', ?, NOW())`,
      [matricule, idBus, dateDebut || new Date(), dateFin || null, tarif || 0, idAdmin]
    );

    const [rows] = await pool.query(`
      SELECT 
        ab.idAbonnement, ab.matricule, ab.idBus, ab.dateDebut, ab.dateFin, ab.tarif, ab.statut,
        e.nom AS eleveNom, e.prenom AS elevePrenom,
        b.libelle AS busLibelle
      FROM AbonnementBus ab
      JOIN Eleve e ON e.matricule = ab.matricule
      JOIN Bus b ON b.idBus = ab.idBus
      WHERE ab.idAbonnement = ?
    `, [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE ABONNEMENT BUS
exports.updateAbonnementBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateFin, tarif, statut } = req.body;

    await pool.query(
      `UPDATE AbonnementBus SET dateFin=?, tarif=?, statut=? WHERE idAbonnement=?`,
      [dateFin, tarif, statut, id]
    );

    const [rows] = await pool.query(`
      SELECT 
        ab.idAbonnement, ab.matricule, ab.idBus, ab.dateDebut, ab.dateFin, ab.tarif, ab.statut,
        e.nom AS eleveNom, e.prenom AS elevePrenom,
        b.libelle AS busLibelle
      FROM AbonnementBus ab
      JOIN Eleve e ON e.matricule = ab.matricule
      JOIN Bus b ON b.idBus = ab.idBus
      WHERE ab.idAbonnement = ?
    `, [id]);

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE (soft) ABONNEMENT BUS
exports.deleteAbonnementBus = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete: set statut to INACTIF and dateFin to now
    const now = new Date().toISOString().split('T')[0];
    await pool.query(`UPDATE AbonnementBus SET statut = 'INACTIF', dateFin = ? WHERE idAbonnement = ?`, [now, id]);
    res.json({ message: 'Abonnement désactivé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
