const pool = require('../database/db');

// Ensure 'capacite' column exists on Salle (safe to run multiple times)
(async function ensureSalleCapacite() {
  try {
    await pool.query(`ALTER TABLE Salle ADD COLUMN capacite INT NULL`);
  } catch (err) {
    // ignore errors (column may already exist)
  }
})();

exports.getClasses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT cl.idClasse, cl.libelle, cl.created_at,
        cl.idSalle,
        s.libelle AS salle,
        cy.libelle AS cycle, cy.idCycle,
        COUNT(DISTINCT s.idSalle) AS nbSalles,
        COUNT(DISTINCT f.matricule) AS nbEleves,
        COALESCE(MAX(s.capacite),0) AS capaciteMax
      FROM Classe cl
      LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle
      LEFT JOIN Salle s ON cl.idSalle = s.idSalle
      LEFT JOIN Frequente f ON f.idClasse = cl.idClasse
      GROUP BY cl.idClasse, cl.libelle, cl.created_at, cl.idSalle, s.libelle, cy.libelle, cy.idCycle
      ORDER BY cl.libelle ASC`);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getClassById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cl.*, cy.libelle AS cycle FROM Classe cl LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle WHERE cl.idClasse = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Classe non trouvee' });

    // fetch the salle linked to this classe (if any)
    const [salles] = await pool.query(`
      SELECT s.*, (
        SELECT COUNT(*) FROM Frequente f WHERE f.idClasse = ?
      ) AS nbEleves
      FROM Salle s
      WHERE s.idSalle = (SELECT idSalle FROM Classe WHERE idClasse = ?)
    `, [req.params.id, req.params.id]);

    const [eleves] = await pool.query(`
      SELECT e.matricule, e.nom, e.prenom, e.sexe, e.actif, c.libelle AS classe, s.libelle AS salle
      FROM Eleve e
      JOIN Frequente f ON f.matricule = e.matricule
      JOIN Classe c ON c.idClasse = f.idClasse
      LEFT JOIN Salle s ON s.idSalle = c.idSalle
      WHERE f.idClasse = ?`, [req.params.id]);

    res.json({ ...rows[0], salles, eleves });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createClass = async (req, res) => {
  try {
    const { libelle, idCycle, idSalle, pension } = req.body;
    if (!libelle) return res.status(400).json({ error: 'Libelle requis' });
    if (!idCycle) return res.status(400).json({ error: 'Veuillez sélectionner un cycle' });
    const idAdmin = req.user?.id || 1000;
    
    // Create Classe
    const [result] = await pool.query(
      `INSERT INTO Classe (libelle, idCycle, idSalle, idAdmin, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [libelle, idCycle, idSalle || null, idAdmin]);
      
    // Handle Scolarite & Tranches
    if (pension && !isNaN(pension)) {
      const montantPension = Number(pension);
      const [scolResult] = await pool.query(
        `INSERT INTO Scolarite (inscription, pension, nbreTranche, description, idCycle, idClasse, idFondateur, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [0, montantPension, 3, '', idCycle, result.insertId, 1]
      );
      
      const idScolarite = scolResult.insertId;
      const t1 = Math.round(montantPension / 3);
      const t2 = Math.round(montantPension / 3);
      const t3 = montantPension - (t1 + t2);
      
      await pool.query(
        `INSERT INTO Tranches (libelle, montant, delai_mois, delai_jour, idScolarite, actif, idFondateur) VALUES 
        ('Tranche 1', ?, '', '', ?, 1, 1),
        ('Tranche 2', ?, '', '', ?, 1, 1),
        ('Tranche 3', ?, '', '', ?, 1, 1)`,
        [t1, idScolarite, t2, idScolarite, t3, idScolarite]
      );
    }
    
    const [rows] = await pool.query(
      `SELECT cl.*, cy.libelle AS cycle FROM Classe cl LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle WHERE cl.idClasse = ?`,
      [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateClass = async (req, res) => {
  try {
    const { libelle, idCycle, idSalle } = req.body;
    if (!idCycle) return res.status(400).json({ error: 'Veuillez sélectionner un cycle' });
    await pool.query(`UPDATE Classe SET libelle=?, idCycle=?, idSalle=? WHERE idClasse=?`, [libelle, idCycle, idSalle || null, req.params.id]);
    const [rows] = await pool.query(
      `SELECT cl.*, cy.libelle AS cycle FROM Classe cl LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle WHERE cl.idClasse = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Classe non trouvee' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteClass = async (req, res) => {
  try {
    await pool.query('DELETE FROM Classe WHERE idClasse = ?', [req.params.id]);
    res.json({ message: 'Classe supprimee' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addSalleToClasse = async (req, res) => {
  try {
    const { idSalle } = req.body;
    if (!idSalle) return res.status(400).json({ error: 'idSalle requis' });

    const [result] = await pool.query(
      'UPDATE Classe SET idSalle = ? WHERE idClasse = ?',
      [idSalle, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Classe non trouvee' });
    }

    const [rows] = await pool.query(
      'SELECT cl.*, cy.libelle AS cycle FROM Classe cl LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle WHERE cl.idClasse = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCycles = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Cycle ORDER BY libelle');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

