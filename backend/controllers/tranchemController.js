const pool = require('../database/db');

// GET ALL TRANCHES
exports.getTranches = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.idTranche, t.libelle, t.montant, t.delai_mois, t.delai_jour, t.actif,
        s.libelle AS scolariteLibelle
      FROM Tranches t
      JOIN Scolarite s ON s.idScolarite = t.idScolarite
      ORDER BY s.libelle, t.libelle
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE TRANCHE
exports.createTranche = async (req, res) => {
  try {
    const { libelle, montant, delai_mois, delai_jour, idScolarite } = req.body;
    if (!libelle || !idScolarite) return res.status(400).json({ error: 'Libelle et idScolarite requis' });

    const idFondateur = req.user?.id || 1;
    const [result] = await pool.query(
      `INSERT INTO Tranches (libelle, montant, delai_mois, delai_jour, idScolarite, actif, idFondateur, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, NOW())`,
      [libelle, montant || 0, delai_mois || '1', delai_jour || '01', idScolarite, idFondateur]
    );

    const [rows] = await pool.query(`
      SELECT 
        t.idTranche, t.libelle, t.montant, t.delai_mois, t.delai_jour, t.actif,
        s.libelle AS scolariteLibelle
      FROM Tranches t
      JOIN Scolarite s ON s.idScolarite = t.idScolarite
      WHERE t.idTranche = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE TRANCHE
exports.updateTranche = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, montant, delai_mois, delai_jour, actif } = req.body;

    await pool.query(
      `UPDATE Tranches SET libelle=?, montant=?, delai_mois=?, delai_jour=?, actif=? WHERE idTranche=?`,
      [libelle, montant, delai_mois, delai_jour, actif !== undefined ? actif : 1, id]
    );

    const [rows] = await pool.query(`
      SELECT 
        t.idTranche, t.libelle, t.montant, t.delai_mois, t.delai_jour, t.actif,
        s.libelle AS scolariteLibelle
      FROM Tranches t
      JOIN Scolarite s ON s.idScolarite = t.idScolarite
      WHERE t.idTranche = ?
    `, [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE TRANCHE
exports.deleteTranche = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Tranches WHERE idTranche = ?', [id]);
    res.json({ message: 'Tranche supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET TRANCHES PAR CYCLE (pour affichage dans admin)
exports.getTranchesParCycle = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.idCycle, c.libelle AS cycleLibelle,
        s.idScolarite, s.inscription, s.pension, s.nbreTranche,
        t.idTranche, t.libelle AS trancheLibelle, t.montant, t.delai_mois, t.delai_jour
      FROM Cycle c
      JOIN Scolarite s ON s.idCycle = c.idCycle
      LEFT JOIN Tranches t ON t.idScolarite = s.idScolarite
      ORDER BY c.libelle, s.idScolarite, t.libelle
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
