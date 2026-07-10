const pool = require('../database/db');

// Récupérer le résumé de discipline
exports.getDisciplineSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.ID, d.libelle, d.points
      FROM Discipline d
      LIMIT 100
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('getDisciplineSummary error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les problèmes de discipline d'un élève
exports.getDisciplineEleve = async (req, res) => {
  try {
    const { matricule } = req.params;
    const params = [];
    let query = `
      SELECT 
        f.idFrequente,
        f.matricule,
        e.nom AS eleveNom,
        e.prenom AS elevePrenom,
        f.created_at,
        f.commentaire,
        s.libelle AS salle,
        CASE 
          WHEN LOWER(COALESCE(f.commentaire, '')) LIKE '%absent%' THEN 'Absent'
          ELSE 'Présent'
        END AS status
      FROM Frequente f
      LEFT JOIN Eleve e ON CAST(e.matricule AS CHAR) COLLATE utf8mb4_unicode_ci = f.matricule COLLATE utf8mb4_unicode_ci
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      WHERE 1=1
    `;

    if (matricule) {
      query += ` AND f.matricule = ?`;
      params.push(matricule);
    }

    query += ` ORDER BY f.created_at DESC LIMIT 200`;

    const [logs] = await pool.query(query, params);
    res.json(logs);
  } catch (error) {
    console.error('getDisciplineEleve error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Créer un problème de discipline
exports.createDisciplineLog = async (req, res) => {
  try {
    const { libelle, points } = req.body;
    
    if (!libelle) {
      return res.status(400).json({ error: 'Champ requis: libelle' });
    }

    const [result] = await pool.query(`
      INSERT INTO Discipline (libelle, points)
      VALUES (?, ?)
    `, [libelle, points || 0]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Problème de discipline enregistré',
      libelle
    });
  } catch (error) {
    console.error('createDisciplineLog error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un problème de discipline
exports.updateDisciplineLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, points } = req.body;

    let updateFields = [];
    let updateValues = [];

    if (libelle) {
      updateFields.push('libelle = ?');
      updateValues.push(libelle);
    }
    if (points !== undefined) {
      updateFields.push('points = ?');
      updateValues.push(points);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
    }

    updateValues.push(id);
    await pool.query(`UPDATE Discipline SET ${updateFields.join(', ')} WHERE ID = ?`, updateValues);

    res.json({ message: 'Problème de discipline mis à jour', id });
  } catch (error) {
    console.error('updateDisciplineLog error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un problème de discipline
exports.deleteDisciplineLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`DELETE FROM Discipline WHERE ID = ?`, [id]);
    res.json({ message: 'Problème de discipline supprimé', id });
  } catch (error) {
    console.error('deleteDisciplineLog error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer statistiques de discipline
exports.getDisciplineStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        d.ID, 
        d.libelle, 
        d.points
      FROM Discipline d
    `);

    res.json(stats);
  } catch (error) {
    console.error('getDisciplineStats error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get absence/discipline data for admin (from Frequente table)
exports.getAbsenceData = async (req, res) => {
  try {
    const { matricule, enseignant, month, year } = req.query;
    
    let query = `
      SELECT 
        f.idFrequente,
        f.matricule,
        e.nom AS eleveNom,
        e.prenom AS elevePrenom,
        f.created_at,
        f.commentaire,
        s.libelle AS salle,
        cl.libelle AS classe,
        CASE 
          WHEN LOWER(COALESCE(f.commentaire, '')) LIKE '%absent%' THEN 'Absent'
          ELSE 'Présent'
        END AS status,
        COALESCE(DATE_FORMAT(f.created_at, '%Y-%m-%d'), DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d')) AS date,
        MONTH(f.created_at) AS mois,
        YEAR(f.created_at) AS annee
      FROM Frequente f
      LEFT JOIN Eleve e ON CAST(e.matricule AS CHAR) COLLATE utf8mb4_unicode_ci = f.matricule COLLATE utf8mb4_unicode_ci
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe cl ON cl.idClasse = s.idClasse
      WHERE 1=1
    `;
    
    const params = [];
    
    if (matricule) {
      query += ` AND f.matricule = ?`;
      params.push(matricule);
    }
    
    if (req.query.date) {
      query += ` AND DATE(f.created_at) = ?`;
      params.push(req.query.date);
    } else {
      if (month) {
        query += ` AND MONTH(f.created_at) = ?`;
        params.push(month);
      }
      
      if (year) {
        query += ` AND YEAR(f.created_at) = ?`;
        params.push(year);
      }
    }
    
    query += ` ORDER BY f.created_at DESC LIMIT 500`;
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('getAbsenceData error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
