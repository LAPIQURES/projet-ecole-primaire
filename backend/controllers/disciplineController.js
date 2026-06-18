const pool = require('../database/db');

// Enregistrer un problème de discipline
exports.createDisciplineLog = async (req, res) => {
  try {
    const { matricule, type, libelle, description, dateEvenement, gravite, nombreAbsences, nombreConvocations, punishment } = req.body;
    
    if (!matricule || !type || !libelle || !dateEvenement) {
      return res.status(400).json({ error: 'Champs requis: matricule, type, libelle, dateEvenement' });
    }

    const idPersEnregistrement = req.user?.id || 1000;
    
    // Récupérer l'année académique actuelle
    const [annees] = await pool.query(`SELECT idAnnee FROM AnneeAcademique ORDER BY created_at DESC LIMIT 1`);
    const idAnnee = annees[0]?.idAnnee || 1;

    const [result] = await pool.query(`
      INSERT INTO DisciplineLog 
      (matricule, idAnnee, type, libelle, description, dateEvenement, 
       gravite, nombreAbsences, nombreConvocations, punition, idPersEnregistrement)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [matricule, idAnnee, type, libelle, description || '', dateEvenement, 
        gravite || 'moyen', nombreAbsences || 0, nombreConvocations || 0, 
        punishment || '', idPersEnregistrement]);

    res.status(201).json({ 
      idDiscipline: result.insertId,
      message: 'Problème de discipline enregistré',
      type
    });
  } catch (error) {
    console.error('createDisciplineLog error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les problèmes de discipline d'un élève
exports.getDisciplineEleve = async (req, res) => {
  try {
    const { matricule } = req.params;
    
    const [logs] = await pool.query(`
      SELECT dl.idDiscipline, dl.matricule, dl.type, dl.libelle, 
             dl.description, dl.dateEvenement, dl.gravite, 
             dl.nombreAbsences, dl.nombreConvocations, dl.punition,
             dl.statut, dl.dateEnregistrement,
             p.nom AS enregistrePar, p.prenom
      FROM DisciplineLog dl
      LEFT JOIN Personne p ON p.idPers = dl.idPersEnregistrement
      WHERE dl.matricule = ?
      ORDER BY dl.dateEvenement DESC
    `, [matricule]);

    res.json(logs);
  } catch (error) {
    console.error('getDisciplineEleve error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer le résumé de discipline pour une classe/année
exports.getDisciplineSummary = async (req, res) => {
  try {
    const { idSalle, idAnnee } = req.query;
    
    let query = `
      SELECT dl.matricule, 
             e.nom, e.prenom,
             COUNT(CASE WHEN dl.type = 'absence' THEN 1 END) AS totalAbsences,
             COUNT(CASE WHEN dl.type = 'convocation' THEN 1 END) AS totalConvocations,
             COUNT(CASE WHEN dl.type = 'infraction' THEN 1 END) AS totalInfractions,
             COUNT(CASE WHEN dl.type = 'avertissement' THEN 1 END) AS totalAvertissements,
             COUNT(CASE WHEN dl.gravite = 'grave' THEN 1 END) AS gravesCount,
             MAX(dl.dateEvenement) AS dernierProbleme
      FROM DisciplineLog dl
      JOIN Eleve e ON e.matricule = dl.matricule
      WHERE 1=1
    `;
    
    let params = [];
    
    if (idSalle) {
      query += ` AND e.matricule IN (
        SELECT DISTINCT f.matricule FROM Frequente f WHERE f.idSalle = ?
      )`;
      params.push(idSalle);
    }
    
    if (idAnnee) {
      query += ` AND dl.idAnnee = ?`;
      params.push(idAnnee);
    }
    
    query += ` GROUP BY dl.matricule, e.nom, e.prenom
              ORDER BY gravesCount DESC, totalConvocations DESC`;
    
    const [summary] = await pool.query(query, params);
    res.json(summary);
  } catch (error) {
    console.error('getDisciplineSummary error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour le statut d'un problème de discipline
exports.updateDisciplineLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, punition, motivation } = req.body;

    let updateFields = [];
    let updateValues = [];

    if (statut) {
      updateFields.push('statut = ?');
      updateValues.push(statut);
    }
    if (punition) {
      updateFields.push('punition = ?');
      updateValues.push(punition);
    }
    if (motivation) {
      updateFields.push('motivation = ?');
      updateValues.push(motivation);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }

    updateValues.push(id);
    await pool.query(`UPDATE DisciplineLog SET ${updateFields.join(', ')} WHERE idDiscipline = ?`, updateValues);

    res.json({ message: 'Problème de discipline mis à jour', idDiscipline: id });
  } catch (error) {
    console.error('updateDisciplineLog error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un problème de discipline
exports.deleteDisciplineLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`DELETE FROM DisciplineLog WHERE idDiscipline = ?`, [id]);
    res.json({ message: 'Problème de discipline supprimé', idDiscipline: id });
  } catch (error) {
    console.error('deleteDisciplineLog error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer statistiques de discipline
exports.getDisciplineStats = async (req, res) => {
  try {
    const { matricule, idAnnee } = req.query;
    
    const [stats] = await pool.query(`
      SELECT 
        type,
        COUNT(*) AS nombre,
        AVG(CASE WHEN gravite = 'grave' THEN 1 ELSE 0 END) AS pourcentageGrave
      FROM DisciplineLog
      WHERE matricule = ? AND idAnnee = ?
      GROUP BY type
    `, [matricule, idAnnee]);

    res.json(stats);
  } catch (error) {
    console.error('getDisciplineStats error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
