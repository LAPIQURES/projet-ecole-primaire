const pool = require('../database/db');

// ─────────────────────────────────────────────
// PUBLIC : stats publiques pour la Landing Page
// ─────────────────────────────────────────────
exports.getPublicStats = async (req, res) => {
  try {
    const [
      [[eleves]],
      [[enseignants]],
      [[classes]],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM Eleve WHERE actif = 1'),
      pool.query('SELECT COUNT(*) as total FROM Enseignant'),
      pool.query('SELECT COUNT(*) as total FROM Classe'),
    ]);

    res.json({
      eleves: eleves.total || 0,
      enseignants: enseignants.total || 0,
      classes: classes.total || 0,
      satisfaction: 98, // You can make this dynamic if you have a rating table
    });
  } catch (error) {
    console.error('getPublicStats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// DIRECTEUR : stats globales de l'école
// Schéma réel: Frequente.idScolarite → Scolarite (inscription + pension)
// ─────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  // (debug log removed)
  try {
    const [
      [[eleves]],
      [[enseignants]],
      [[classes]],
      [[paiementsMois]],
      [[impayesCount]],
      [elevesRecents],
      [[capaciteMax]],
      [[rapportsMois]],
      [repartitionClasses],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM Eleve WHERE actif = 1'),
      pool.query('SELECT COUNT(*) as total FROM Enseignant'),
      pool.query('SELECT COUNT(*) as total FROM Classe'),
      pool.query(`SELECT COALESCE(SUM(montant),0) as total FROM Paiement
                  WHERE MONTH(datePaie) = MONTH(CURDATE()) AND YEAR(datePaie) = YEAR(CURDATE())`),
      // Élèves dont le payé < scolarité totale (inscription + pension)
      pool.query(`
        SELECT COUNT(DISTINCT e.matricule) as total
        FROM Eleve e
        LEFT JOIN Frequente f ON f.matricule = e.matricule
        LEFT JOIN Scolarite sc ON sc.idScolarite = f.idScolarite
        WHERE e.actif = 1 AND (
          SELECT COALESCE(SUM(p.montant),0) FROM Paiement p WHERE p.matricule = e.matricule
        ) < (COALESCE(sc.inscription, 0) + COALESCE(sc.pension, 0))
      `),
      pool.query(`
        SELECT e.matricule, e.nom, e.prenom, e.created_at, e.photoURL, c.libelle as classe
        FROM Eleve e
        LEFT JOIN Frequente f ON f.matricule = e.matricule
        LEFT JOIN Classe c ON c.idClasse = f.idClasse
        LEFT JOIN Salle s ON s.idSalle = c.idSalle
        WHERE e.actif = 1
        ORDER BY e.created_at DESC LIMIT 5
      `),
      pool.query('SELECT COALESCE(SUM(capacite),0) AS total FROM Salle'),
      pool.query(`SELECT COUNT(*) as total FROM Rapport
                  WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`),
      pool.query(`
        SELECT c.libelle, COUNT(DISTINCT f.matricule) as effectif, s.capacite
        FROM Classe c
        LEFT JOIN Salle s ON s.idSalle = c.idSalle
        LEFT JOIN Frequente f ON f.idClasse = c.idClasse
        GROUP BY c.idClasse, c.libelle, s.capacite
        ORDER BY effectif DESC
        LIMIT 8
      `),
    ]);

    res.json({
      stats: {
        totalEleves: eleves.total,
        totalEnseignants: enseignants.total,
        totalClasses: classes.total,
        paiementsMois: Number(paiementsMois.total || 0),
        impayesCount: impayesCount.total,
        capaciteMax: capaciteMax.total || 0,
        rapportsMois: rapportsMois.total,
      },
      elevesRecents,
      repartitionClasses,
    });
  } catch (error) {
    console.error('Erreur stats dashboard directeur:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// INTENDANT : données financières détaillées
// Jointure correcte: Frequente.idScolarite → Scolarite
// ─────────────────────────────────────────────
exports.getIntendantDashboard = async (req, res) => {
  try {
    const [
      [[encaissementsAnnee]],
      [[encaissementsMois]],
      [[totalDettes]],
      [repartitionModes],
      [elevesDettes],
      [paiementsRecents],
    ] = await Promise.all([
      // Total encaissé cette année
      pool.query(`SELECT COALESCE(SUM(montant),0) as total FROM Paiement
                  WHERE YEAR(datePaie) = YEAR(CURDATE())`),

      // Total encaissé ce mois
      pool.query(`SELECT COALESCE(SUM(montant),0) as total FROM Paiement
                  WHERE MONTH(datePaie) = MONTH(CURDATE()) AND YEAR(datePaie) = YEAR(CURDATE())`),

      // Montant total des dettes via Frequente.idScolarite
      pool.query(`
        SELECT COALESCE(SUM(
          (COALESCE(sc.inscription,0) + COALESCE(sc.pension,0)) - COALESCE(paye.totalPaye, 0)
        ), 0) AS total
        FROM Eleve e
        LEFT JOIN Frequente f ON f.matricule = e.matricule
        LEFT JOIN Scolarite sc ON sc.idScolarite = f.idScolarite
        LEFT JOIN (
          SELECT matricule, SUM(montant) as totalPaye FROM Paiement GROUP BY matricule
        ) paye ON paye.matricule = e.matricule
        WHERE e.actif = 1
          AND ((COALESCE(sc.inscription,0) + COALESCE(sc.pension,0)) > COALESCE(paye.totalPaye, 0))
      `),

      // Répartition par mode de paiement
      pool.query(`
        SELECT m.libelle AS modePaiement, COALESCE(SUM(p.montant),0) as total, COUNT(*) as nb
        FROM Paiement p
        LEFT JOIN Mode m ON m.idMode = p.idMode
        WHERE YEAR(p.datePaie) = YEAR(CURDATE())
        GROUP BY m.idMode, m.libelle
        ORDER BY total DESC
      `),

      // Liste détaillée des élèves en dette via Frequente.idScolarite
      pool.query(`
        SELECT
          e.matricule,
          e.nom,
          e.prenom,
          c.libelle AS classe,
          (COALESCE(sc.inscription,0) + COALESCE(sc.pension,0)) AS scolariteTotale,
          COALESCE(paye.totalPaye, 0) AS totalPaye,
          ((COALESCE(sc.inscription,0) + COALESCE(sc.pension,0)) - COALESCE(paye.totalPaye, 0)) AS reste,
          pr.nom AS parentNom,
          pr.prenom AS parentPrenom,
          pr.mobile
        FROM Eleve e
        LEFT JOIN Frequente f ON f.matricule = e.matricule
        LEFT JOIN Classe c ON c.idClasse = f.idClasse
        LEFT JOIN Salle sal ON sal.idSalle = c.idSalle
        LEFT JOIN Scolarite sc ON sc.idCycle = c.idCycle
        LEFT JOIN (
          SELECT matricule, SUM(montant) as totalPaye FROM Paiement GROUP BY matricule
        ) paye ON paye.matricule = e.matricule
        LEFT JOIN ParentEleve pe ON pe.matricule = e.matricule
        LEFT JOIN Personne pr ON pr.idPers = pe.idPers
        WHERE e.actif = 1
          AND ((COALESCE(sc.inscription,0) + COALESCE(sc.pension,0)) - COALESCE(paye.totalPaye, 0)) > 0
        GROUP BY e.matricule, e.nom, e.prenom, c.libelle, sc.inscription, sc.pension, paye.totalPaye, pr.nom, pr.prenom, pr.mobile
        ORDER BY reste DESC
        LIMIT 200
      `),

      // 10 derniers paiements
      pool.query(`
        SELECT p.idPaie, p.matricule, p.montant, p.datePaie, m.libelle AS modePaiement,
               e.nom, e.prenom
        FROM Paiement p
        LEFT JOIN Mode m ON m.idMode = p.idMode
        LEFT JOIN Eleve e ON e.matricule = p.matricule
        ORDER BY p.datePaie DESC
        LIMIT 10
      `),
    ]);

    res.json({
      encaissements: Number(encaissementsAnnee.total || 0),
      encaissementsMois: Number(encaissementsMois.total || 0),
      totalDettes: Number(totalDettes.total || 0),
      dettesCount: elevesDettes.length,
      repartitionModes,
      elevesDettes,
      paiementsRecents,
    });
  } catch (error) {
    console.error('getIntendantDashboard error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// Paiements mensuels (graphique courbe)
// ─────────────────────────────────────────────
exports.getPaiementsMensuel = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(datePaie, '%Y-%m') as mois,
        DATE_FORMAT(datePaie, '%b %Y') as label,
        SUM(montant) as total,
        COUNT(*) as nbPaiements
      FROM Paiement
      WHERE datePaie >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(datePaie, '%Y-%m'), DATE_FORMAT(datePaie, '%b %Y')
      ORDER BY mois ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// Inscriptions mensuelles (graphique courbe)
// ─────────────────────────────────────────────
exports.getInscriptionsMensuel = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS mois,
        DATE_FORMAT(created_at, '%b %Y') AS label,
        COUNT(*) AS total
      FROM Eleve
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b %Y')
      ORDER BY mois ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
