const pool = require('../database/db');

// Helper: Calculer moyenne générale
function calculerMoyenne(notes) {
  const validNotes = notes.filter(n => n > 0 && !isNaN(n));
  if (validNotes.length === 0) return 0;
  return (validNotes.reduce((a, b) => a + b) / validNotes.length).toFixed(2);
}

// Helper: Obtenir appréciation basée sur la note
function obtenirAppreciation(note) {
  if (note >= 16) return 'Excellent';
  if (note >= 14) return 'Très bon';
  if (note >= 12) return 'Bon';
  if (note >= 10) return 'Satisfaisant';
  if (note >= 8) return 'Moyen';
  return 'Faible';
}

// Créer un nouveau bulletin
exports.createBulletin = async (req, res) => {
  try {
    const { matricule, idAnnee, idTrimes, appreciationGeneral } = req.body;
    
    if (!matricule || !idAnnee || !idTrimes) {
      return res.status(400).json({ error: 'Matricule, année et trimestre requis' });
    }

    const idPers = req.user?.id || 1000;

    // Récupérer les notes de l'élève pour ce trimestre
    const [evaluations] = await pool.query(`
      SELECT DISTINCT ev.idEval, ev.note, ev.appreciation, 
             c.idCours, c.libelle, c.coefficient,
             t.idTrimes
      FROM Evaluation ev
      JOIN Cours c ON c.idCours = ev.idCours
      JOIN Session s ON s.idSession = ev.idSession
      JOIN Trimestre t ON t.idTrimes = s.idTrimestre
      WHERE ev.matricule = ? AND t.idTrimes = ? 
      ORDER BY c.libelle
    `, [matricule, idTrimes]);

    if (evaluations.length === 0) {
      return res.status(400).json({ error: 'Aucune évaluation trouvée pour ce trimestre' });
    }

    // Vérifier si bulletin n'existe pas déjà
    const [existing] = await pool.query(
      'SELECT idBulletin FROM Bulletin WHERE matricule = ? AND idTrimes = ? AND idAnnee = ?',
      [matricule, idTrimes, idAnnee]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Un bulletin existe déjà pour ce trimestre' });
    }

    // Créer le bulletin
    const [result] = await pool.query(`
      INSERT INTO Bulletin (matricule, idAnnee, idTrimes, appreciation, idPers, statut, dateGeneration)
      VALUES (?, ?, ?, ?, ?, 'brouillon', NOW())
    `, [matricule, idAnnee, idTrimes, appreciationGeneral || '', idPers]);

    const idBulletin = result.insertId;

    // Insérer les détails du bulletin avec coefficient
    const allNotes = [];
    for (const eval of evaluations) {
      const appreciation = eval.appreciation || obtenirAppreciation(eval.note);
      await pool.query(`
        INSERT INTO BulletinDetail (idBulletin, idCours, libelleCours, note, appreciation, coefficient)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [idBulletin, eval.idCours, eval.libelle, eval.note || 0, appreciation, eval.coefficient || 1]);
      
      allNotes.push(eval.note || 0);
    }

    // Calculer la moyenne générale
    const moyenneGenerale = calculerMoyenne(allNotes);
    
    await pool.query(`UPDATE Bulletin SET moyenneGenerale = ? WHERE idBulletin = ?`, 
      [moyenneGenerale, idBulletin]);

    res.status(201).json({ 
      idBulletin, 
      message: 'Bulletin créé avec succès',
      evaluations: evaluations.length,
      moyenneGenerale
    });
  } catch (error) {
    console.error('createBulletin error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les bulletins d'un élève
exports.getBulletinsEleve = async (req, res) => {
  try {
    const { matricule } = req.params;
    
    const [bulletins] = await pool.query(`
      SELECT b.idBulletin, b.matricule, b.idAnnee, b.idTrimes, 
             b.dateGeneration, b.statut, b.moyenneGenerale, 
             b.appreciation, a.libelle AS annee, t.libelle AS trimestre,
             COUNT(bd.idDetail) AS nombreCours
      FROM Bulletin b
      JOIN AnneeAcademique a ON a.idAnnee = b.idAnnee
      JOIN Trimestre t ON t.idTrimes = b.idTrimes
      LEFT JOIN BulletinDetail bd ON bd.idBulletin = b.idBulletin
      WHERE b.matricule = ?
      GROUP BY b.idBulletin
      ORDER BY a.idAnnee DESC, t.idTrimes DESC
    `, [matricule]);

    res.json(bulletins);
  } catch (error) {
    console.error('getBulletinsEleve error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les détails d'un bulletin avec infos complètes
exports.getBulletinDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [bulletin] = await pool.query(`
      SELECT b.*, a.libelle AS annee, t.libelle AS trimestre,
             e.nom AS eleveNom, e.prenom AS elevePrenom, 
             e.sexe, e.dateNaissance, s.libelle AS classe,
             c.libelle AS cycle, e.matricule
      FROM Bulletin b
      JOIN AnneeAcademique a ON a.idAnnee = b.idAnnee
      JOIN Trimestre t ON t.idTrimes = b.idTrimes
      JOIN Eleve e ON e.matricule = b.matricule
      LEFT JOIN Frequente f ON f.matricule = e.matricule AND f.actif = 1
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe cl ON cl.idClasse = s.idClasse
      LEFT JOIN Cycle c ON c.idCycle = cl.idCycle
      WHERE b.idBulletin = ?
    `, [id]);

    if (!bulletin.length) {
      return res.status(404).json({ error: 'Bulletin non trouvé' });
    }

    const [details] = await pool.query(`
      SELECT bd.idDetail, bd.idCours, bd.libelleCours, 
             bd.note, bd.appreciation, bd.appreciation_long, 
             bd.coefficient, c.code AS codeCoursAS 
      FROM BulletinDetail bd
      LEFT JOIN Cours c ON c.idCours = bd.idCours
      WHERE bd.idBulletin = ?
      ORDER BY bd.libelleCours
    `, [id]);

    // Calculer statistiques
    const notes = details.map(d => parseFloat(d.note) || 0).filter(n => n > 0);
    const moyenneGenerale = notes.length > 0 ? (notes.reduce((a, b) => a + b) / notes.length).toFixed(2) : 0;
    
    res.json({ 
      ...bulletin[0], 
      details,
      moyenneGenerale,
      nombreCours: details.length,
      effectifClasse: 30 // À obtenir de la BD si nécessaire
    });
  } catch (error) {
    console.error('getBulletinDetail error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Finaliser/Publier un bulletin
exports.publishBulletin = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body; // 'finalisé' ou 'publié'

    if (!['finalisé', 'publié'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    await pool.query(`UPDATE Bulletin SET statut = ? WHERE idBulletin = ?`, [statut, id]);
    
    res.json({ message: `Bulletin ${statut}`, idBulletin: id });
  } catch (error) {
    console.error('publishBulletin error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un bulletin
exports.updateBulletin = async (req, res) => {
  try {
    const { id } = req.params;
    const { appreciation, moyenneGenerale } = req.body;

    let updateFields = [];
    let updateValues = [];

    if (appreciation !== undefined) {
      updateFields.push('appreciation = ?');
      updateValues.push(appreciation);
    }
    if (moyenneGenerale !== undefined) {
      updateFields.push('moyenneGenerale = ?');
      updateValues.push(moyenneGenerale);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }

    updateValues.push(id);
    await pool.query(`UPDATE Bulletin SET ${updateFields.join(', ')} WHERE idBulletin = ?`, updateValues);

    res.json({ message: 'Bulletin mis à jour', idBulletin: id });
  } catch (error) {
    console.error('updateBulletin error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un bulletin
exports.deleteBulletin = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`DELETE FROM Bulletin WHERE idBulletin = ?`, [id]);
    res.json({ message: 'Bulletin supprimé', idBulletin: id });
  } catch (error) {
    console.error('deleteBulletin error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
