const pool = require('../database/db');
const { getTableColumns, selectColumns } = require('../utils/schema');

let cachedPersonneColumns;
async function resolvePersonneColumns() {
  if (cachedPersonneColumns !== undefined) return cachedPersonneColumns;
  cachedPersonneColumns = await getTableColumns('Personne');
  return cachedPersonneColumns;
}

exports.getEleves = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.matricule, e.nom, e.prenom, e.sexe,
        e.dateNaissance, e.lieuNaissance, e.langue,
        e.photoURL, e.actif, e.created_at,
        s.libelle AS salle, s.idSalle, s.position AS sallePosition,
        c.libelle AS classe, c.idClasse,
        cy.libelle AS cycle,
        p.nom AS parentNom, p.prenom AS parentPrenom, p.mobile AS parentMobile
      FROM Eleve e
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      LEFT JOIN Parents pr ON pr.matricule = e.matricule
      LEFT JOIN Personne p ON p.idPers = pr.idPers
      ORDER BY e.created_at DESC LIMIT 500
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEleveById = async (req, res) => {
  try {
    const { id } = req.params;
    const personneCols = await resolvePersonneColumns();
    const [rows] = await pool.query(`
      SELECT e.*, s.libelle AS salle, s.idSalle,
        c.libelle AS classe, c.idClasse, cy.libelle AS cycle
      FROM Eleve e
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      WHERE e.matricule = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Eleve non trouve' });

    const [
      [rapports],
      [parents],
      [evaluations]
    ] = await Promise.all([
      pool.query(`
        SELECT r.*, a.libelle AS annee FROM Rapport r
        LEFT JOIN AnneeAcademique a ON a.idAnnee = r.idAca
        WHERE r.matricule = ? ORDER BY r.event_date DESC`, [id]),
      pool.query(`
        SELECT ${selectColumns('p', personneCols, ['nom', 'prenom', 'mobile', 'phone', 'email', 'username'])}
        FROM Parents pr JOIN Personne p ON p.idPers = pr.idPers
        WHERE pr.matricule = ?`, [id]),
      pool.query(`
        SELECT ev.note, ev.appreciation, ev.created_at,
          c.libelle AS cours, s2.libelle AS session, t.libelle AS trimestre
        FROM Evaluation ev
        LEFT JOIN Cours c ON c.idCours = ev.idCours
        LEFT JOIN Session s2 ON s2.idSession = ev.idSession
        LEFT JOIN Trimestre t ON t.idTrimes = s2.idTrimestre
        WHERE ev.matricule = ?
        ORDER BY ev.created_at DESC`, [id])
    ]);

    res.json({ ...rows[0], rapports, parents, evaluations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEleve = async (req, res) => {
  try {
    const { nom, prenom, sexe, dateNaissance, lieuNaissance, langue, idSalle, photoURL } = req.body;
    if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prenom requis' });
    const idAdmin = req.user?.id || 1000;
    const matricule = Date.now() % 100000000;

    // Get first VilleNaissance as default
    const [villes] = await pool.query('SELECT idVille FROM VilleNaissance LIMIT 1');
    const idVille = villes.length > 0 ? villes[0].idVille : null;

    await pool.query(
      `INSERT INTO Eleve (matricule, nom, prenom, sexe, dateNaissance, lieuNaissance, langue, photoURL, actif, idAdmin, idVilleNaissance, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, NOW())`,
      [matricule, nom, prenom, sexe || 1, dateNaissance || null, lieuNaissance || '', langue || 'Francais', photoURL || '', idAdmin, idVille]
    );

    if (idSalle) {
      const [annees] = await pool.query('SELECT idAnnee FROM AnneeAcademique ORDER BY created_at DESC LIMIT 1');
      const idAcademi = annees.length > 0 ? annees[0].idAnnee : 1;
      await pool.query(
        `INSERT INTO Frequente (idSalle, idAcademi, matricule, idAdmin, created_at) VALUES (?, ?, ?, ?, NOW())`,
        [idSalle, idAcademi, matricule, idAdmin]
      );
    }

    const [newEleve] = await pool.query(`
      SELECT e.*, s.libelle AS salle, c.libelle AS classe
      FROM Eleve e
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      WHERE e.matricule = ?`, [matricule]);
    res.status(201).json(newEleve[0]);
  } catch (error) {
    console.error('createEleve error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateEleve = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, sexe, dateNaissance, lieuNaissance, langue, actif, idSalle, photoURL } = req.body;
    await pool.query(
      `UPDATE Eleve SET nom=?, prenom=?, sexe=?, dateNaissance=?, lieuNaissance=?, langue=?, actif=?, photoURL=? WHERE matricule=?`,
      [nom, prenom, sexe || 1, dateNaissance || null, lieuNaissance || '', langue || 'Francais', actif !== undefined ? actif : 1, photoURL || '', id]
    );
    if (idSalle) {
      const [ex] = await pool.query('SELECT idFrequente FROM Frequente WHERE matricule = ?', [id]);
      if (ex.length > 0) await pool.query('UPDATE Frequente SET idSalle=? WHERE matricule=?', [idSalle, id]);
      else {
        const [annees] = await pool.query('SELECT idAnnee FROM AnneeAcademique ORDER BY created_at DESC LIMIT 1');
        await pool.query('INSERT INTO Frequente (idSalle, idAcademi, matricule, idAdmin, created_at) VALUES (?, ?, ?, ?, NOW())',
          [idSalle, annees[0]?.idAnnee || 1, id, req.user?.id || 1000]);
      }
    }
    const [rows] = await pool.query(`
      SELECT e.*, s.libelle AS salle, c.libelle AS classe
      FROM Eleve e LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle LEFT JOIN Classe c ON c.idClasse = s.idClasse
      WHERE e.matricule = ?`, [id]);
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteEleve = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE Eleve SET actif = 0 WHERE matricule = ?', [id]);
    res.json({ message: 'Eleve desactive', matricule: id });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.activateEleve = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE Eleve SET actif = 1 WHERE matricule = ?', [id]);
    res.json({ message: 'Eleve active', matricule: id });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createRapport = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, points, commentaire, event_date } = req.body;
    const idPers = req.user?.id || 1000;
    const [annees] = await pool.query('SELECT idAnnee FROM AnneeAcademique ORDER BY created_at DESC LIMIT 1');
    const idAca = annees[0]?.idAnnee || 1;
    const [result] = await pool.query(
      `INSERT INTO Rapport (libelle, points, matricule, idAca, commentaire, event_date, idPers, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [libelle, points || 0, id, idAca, commentaire || '', event_date || new Date().toISOString().split('T')[0], idPers]
    );
    res.status(201).json({ idRap: result.insertId, message: 'Rapport créé' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
