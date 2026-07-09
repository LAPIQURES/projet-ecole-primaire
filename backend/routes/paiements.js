const express = require('express');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');
const pool = require('../database/db');
const router = express.Router();
const socketHelper = require('../socket');
const verifyParent = require('../middleware/verifyParent');

async function resolvePaiementAllocation(matricule, montant) {
  const total = Number(montant || 0);
  const [tranches] = await pool.query(`
    SELECT idTranche, libelle, montant, delai, idScolarite
    FROM Tranches
    ORDER BY idTranche ASC
  `);

  let cumul = 0;
  for (const tranche of tranches) {
    const trancheMontant = Number(tranche.montant || 0);
    const next = cumul + trancheMontant;
    if (total < next) {
      return { tranche: tranche.libelle, statut: `Avance sur ${tranche.libelle}`, resteARegler: Math.max(0, next - total) };
    }
    if (total === next) {
      return { tranche: tranche.libelle, statut: `Solde la ${tranche.libelle}`, resteARegler: 0 };
    }
    cumul = next;
  }

  return { tranche: tranches[tranches.length - 1]?.libelle || 'Aucune tranche', statut: 'Paiement au-delà des tranches connues', resteARegler: 0 };
}

async function getTableColumns(tableName) {
  const [cols] = await pool.query(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [require('../config').db.database, tableName]
  );
  return cols.map((c) => c.COLUMN_NAME);
}

// GET tous les paiements avec nom élève
router.get('/', verifyToken, async (req, res) => {
  try {
    // If caller is a parent, restrict to their children
    if (req.user && req.user.role === 'parent') {
      const [matrices] = await pool.query('SELECT matricule FROM Parents WHERE idPers = ?', [req.user.id]);
      const matList = matrices.map((r) => r.matricule).filter(Boolean);
      if (matList.length === 0) return res.json([]);
      const [rows] = await pool.query(`
        SELECT p.*, e.nom, e.prenom, m.libelle AS mode,
          per.nom AS payeurNom, per.prenom AS payeurPrenom, per.typePersonne AS payeurType
        FROM Paiement p
        LEFT JOIN Eleve e ON e.matricule = p.matricule
        LEFT JOIN Mode m ON m.idMode = p.idMode
        LEFT JOIN Personne per ON per.idPers = p.idPers
        WHERE p.matricule IN (?)
        ORDER BY p.dateEnregistrer DESC
        LIMIT 300
      `, [matList]);
      return res.json(rows);
    }

    const [rows] = await pool.query(`
      SELECT p.*, e.nom, e.prenom, m.libelle AS mode,
        per.nom AS payeurNom, per.prenom AS payeurPrenom, per.typePersonne AS payeurType
      FROM Paiement p
      LEFT JOIN Eleve e ON e.matricule = p.matricule
      LEFT JOIN Mode m ON m.idMode = p.idMode
      LEFT JOIN Personne per ON per.idPers = p.idPers
      ORDER BY p.dateEnregistrer DESC
      LIMIT 300
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, e.nom AS eleveNom, e.prenom AS elevePrenom, e.matricule AS eleveMatricule,
        s.libelle AS eleveSalle, c.libelle AS eleveClasse, m.libelle AS mode,
        per.nom AS payeurNom, per.prenom AS payeurPrenom, per.typePersonne AS payeurType
      FROM Paiement p
      LEFT JOIN Eleve e ON e.matricule = p.matricule
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Mode m ON m.idMode = p.idMode
      LEFT JOIN Personne per ON per.idPers = p.idPers
      WHERE p.idPaie = ?
      LIMIT 1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Paiement non trouvé' });
    const allocation = await resolvePaiementAllocation(rows[0].matricule, rows[0].montant);
    res.json({ ...rows[0], allocation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET modes de paiement
router.get('/modes', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT idMode, libelle FROM Mode WHERE actif = 1');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST nouveau paiement
router.post('/', verifyToken, verifyParent, async (req, res) => {
  try {
    const { matricule, montant, idMode, commentaire, datePaie } = req.body;
    if (!matricule || !montant) return res.status(400).json({ error: 'Matricule et montant requis' });
    const idPers = req.user?.id || 1;
    const [annees] = await pool.query('SELECT idAnnee FROM AnneeAcademique ORDER BY created_at DESC LIMIT 1');
    const idAca = annees.length > 0 ? annees[0].idAnnee : 1;
    // Build INSERT dynamically based on actual table columns to avoid schema mismatches
    const cols = await getTableColumns('Paiement');
    const insertCols = [];
    const placeholders = [];
    const values = [];

    const addIf = (name, val) => { if (cols.includes(name)) { insertCols.push(name); placeholders.push('?'); values.push(val); } };
    addIf('matricule', matricule);
    addIf('idAca', idAca);
    addIf('montant', montant);
    if (cols.includes('idMode')) {
      if (idMode !== undefined && idMode !== null) addIf('idMode', idMode);
      else {
        // try to pick a default active mode
        try {
          const [modes] = await pool.query('SELECT idMode FROM Mode WHERE actif = 1 LIMIT 1');
          if (modes.length) addIf('idMode', modes[0].idMode);
          else addIf('idMode', 1);
        } catch (e) { addIf('idMode', 1); }
      }
    }
    addIf('commentaire', commentaire || '');
    addIf('idPers', idPers);
    addIf('datePaie', datePaie || new Date().toISOString().split('T')[0]);
    if (cols.includes('dateEnregistrer')) {
      insertCols.push('dateEnregistrer'); placeholders.push('NOW()');
    }

    if (insertCols.length === 0) return res.status(500).json({ error: 'Aucune colonne reconnue pour Paiement' });
      // If DB requires idMode but it wasn't detected, attempt to include a default idMode
      if (!insertCols.includes('idMode')) {
        try {
          const [modes] = await pool.query('SELECT idMode FROM Mode WHERE actif = 1 LIMIT 1');
          const defaultMode = (modes.length ? modes[0].idMode : 1);
          insertCols.push('idMode'); placeholders.push('?'); values.push(defaultMode);
        } catch (e) {
          // best-effort: include 1
          insertCols.push('idMode'); placeholders.push('?'); values.push(1);
        }
      }
    const sql = `INSERT INTO Paiement (${insertCols.join(',')}) VALUES (${placeholders.join(',')})`;
    console.log('Paiement INSERT SQL:', sql, values);
    const [result] = await pool.query(sql, values);
    const [rows] = await pool.query('SELECT * FROM Paiement WHERE idPaie = ?', [result.insertId]);
    const allocation = await resolvePaiementAllocation(matricule, montant);
    res.status(201).json({ ...rows[0], allocation });
    try {
      const io = socketHelper.get();
      io.to(`student-${matricule}`).emit('paiement:created', { ...rows[0], allocation });
      io.emit('paiement:created:global', { matricule, idPaie: rows[0].idPaie });
    } catch (e) { }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
