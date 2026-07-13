const pool = require('../database/db');

// Helper: Calculer moyenne pondérée (note × coefficient / Σ coefficients)
function calculerMoyennePonderee(details) {
  let totalCoeff = 0;
  let totalPoints = 0;
  for (const d of details) {
    const note = parseFloat(d.note);
    const coeff = parseFloat(d.coefficient) || 1;
    if (!isNaN(note) && note >= 0) {
      totalPoints += note * coeff;
      totalCoeff += coeff;
    }
  }
  if (totalCoeff === 0) return 0;
  return parseFloat((totalPoints / totalCoeff).toFixed(2));
}

// Helper: Obtenir appréciation basée sur la note
function obtenirAppreciation(note) {
  if (note >= 16) return 'Excellent';
  if (note >= 14) return 'Très bien';
  if (note >= 12) return 'Bien';
  if (note >= 10) return 'Assez bien';
  if (note >= 8) return 'Passable';
  return 'Insuffisant';
}

function getGrade(note) {
  if (note >= 16) return 'A+';
  if (note >= 14) return 'A';
  if (note >= 12) return 'B';
  if (note >= 10) return 'C';
  return 'F';
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
    const detailsForAvg = [];
    for (const ev of evaluations) {
      const appreciation = ev.appreciation || obtenirAppreciation(ev.note);
      await pool.query(`
        INSERT INTO BulletinDetail (idBulletin, idCours, libelleCours, note, appreciation, coefficient)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [idBulletin, ev.idCours, ev.libelle, ev.note || 0, appreciation, ev.coefficient || 1]);
      
      detailsForAvg.push({ note: ev.note, coefficient: ev.coefficient || 1 });
    }

    // Calculer la moyenne pondérée
    const moyenneGenerale = calculerMoyennePonderee(detailsForAvg);
    
    await pool.query(`UPDATE Bulletin SET moyenneGenerale = ? WHERE idBulletin = ?`, 
      [moyenneGenerale, idBulletin]);

    res.status(201).json({ 
      idBulletin, 
      message: evaluations.length > 0 ? 'Bulletin créé avec succès' : 'Bulletin brouillon créé sans évaluations',
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
      GROUP BY b.idBulletin, b.matricule, b.idAnnee, b.idTrimes, b.dateGeneration, b.statut, b.moyenneGenerale, b.appreciation, a.libelle, t.libelle
      ORDER BY a.idAnnee DESC, t.idTrimes DESC
    `, [matricule]);

    res.json(bulletins);
  } catch (error) {
    console.error('getBulletinsEleve error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les détails d'un bulletin avec infos complètes + rang + moyenne classe
exports.getBulletinDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get bulletin info — FIXED: removed f.actif = 1 (column doesn't exist)
    const [bulletin] = await pool.query(`
      SELECT b.*, a.libelle AS annee, t.libelle AS trimestre,
             e.nom AS eleveNom, e.prenom AS elevePrenom, 
             e.sexe, e.dateNaissance, e.photoURL,
             s.libelle AS salle, cl.libelle AS classe,
             cy.libelle AS cycle, e.matricule
      FROM Bulletin b
      JOIN AnneeAcademique a ON a.idAnnee = b.idAnnee
      JOIN Trimestre t ON t.idTrimes = b.idTrimes
      JOIN Eleve e ON CAST(e.matricule AS CHAR) = CAST(b.matricule AS CHAR)
      LEFT JOIN Frequente f ON CAST(f.matricule AS CHAR) = CAST(e.matricule AS CHAR)
      LEFT JOIN Classe cl ON cl.idClasse = f.idClasse
      LEFT JOIN Salle s ON s.idSalle = cl.idSalle
      LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle
      WHERE b.idBulletin = ?
      ORDER BY f.created_at DESC
      LIMIT 1
    `, [id]);

    if (!bulletin.length) {
      return res.status(404).json({ error: 'Bulletin non trouvé' });
    }

    const bull = bulletin[0];

    // Get bulletin details (notes par matière)
    const [details] = await pool.query(`
      SELECT bd.idDetail, bd.idCours, bd.libelleCours, 
             bd.note, bd.appreciation, bd.appreciation_long, 
             bd.coefficient
      FROM BulletinDetail bd
      WHERE bd.idBulletin = ?
      ORDER BY bd.libelleCours
    `, [id]);

    // Calculer la moyenne pondérée
    const moyenneGenerale = calculerMoyennePonderee(details);

    // Trouver l'effectif de la classe et calculer le rang
    let effectifClasse = 0;
    let rang = 0;
    let moyenneClasse = 0;
    let moyenneMax = 0;
    let moyenneMin = 0;

    if (bull.idTrimes && bull.idAnnee) {
      // Get all bulletins for the same trimester/year to compute rank
      const [allBulletins] = await pool.query(`
        SELECT b2.matricule, b2.moyenneGenerale
        FROM Bulletin b2
        WHERE b2.idTrimes = ? AND b2.idAnnee = ?
        ORDER BY b2.moyenneGenerale DESC
      `, [bull.idTrimes, bull.idAnnee]);

      effectifClasse = allBulletins.length;
      
      if (allBulletins.length > 0) {
        const allMoyennes = allBulletins.map(b => parseFloat(b.moyenneGenerale) || 0);
        moyenneClasse = parseFloat((allMoyennes.reduce((a, b) => a + b, 0) / allMoyennes.length).toFixed(2));
        moyenneMax = Math.max(...allMoyennes);
        moyenneMin = Math.min(...allMoyennes);
        
        // Compute rank
        const sorted = allBulletins.sort((a, b) => (parseFloat(b.moyenneGenerale) || 0) - (parseFloat(a.moyenneGenerale) || 0));
        rang = sorted.findIndex(b => String(b.matricule) === String(bull.matricule)) + 1;
        if (rang === 0) rang = effectifClasse;
      }
    }

    res.json({ 
      ...bull, 
      details,
      moyenneGenerale,
      nombreCours: details.length,
      effectifClasse,
      rang,
      moyenneClasse,
      moyenneMax,
      moyenneMin
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

// Générer HTML imprimable pour tous les bulletins d'une classe/salle
exports.generateClassBulletins = async (req, res) => {
  try {
    const { idClasse, idSalle, idAnnee, idTrimes } = req.body;
    if (!idAnnee || !idTrimes || (!idClasse && !idSalle)) {
      return res.status(400).json({ error: 'idAnnee, idTrimes et idClasse ou idSalle requis' });
    }

    const [[anneeRow]] = await pool.query(`SELECT libelle FROM AnneeAcademique WHERE idAnnee = ?`, [idAnnee]);
    const [[trimestreRow]] = await pool.query(`SELECT libelle FROM Trimestre WHERE idTrimes = ?`, [idTrimes]);

    let selectionLabel = 'Classe';
    let selectionValue = '';
    let params = [];
    let whereClause = '';

    if (idSalle) {
      selectionLabel = 'Salle';
      const [[salleRow]] = await pool.query(
        `SELECT s.libelle AS salle, cl.libelle AS classe FROM Salle s LEFT JOIN Classe cl ON cl.idSalle = s.idSalle WHERE s.idSalle = ?`,
        [idSalle]
      );
      selectionValue = salleRow ? `${salleRow.salle} (${salleRow.classe || ''})` : `Salle ${idSalle}`;
      // select students where their classe points to this salle
      whereClause = 'WHERE cl.idSalle = ? AND f.idAcademi = ?';
      params = [idSalle, idAnnee];
    } else {
      const [[classeRow]] = await pool.query(`SELECT libelle FROM Classe WHERE idClasse = ?`, [idClasse]);
      selectionValue = classeRow ? classeRow.libelle : `Classe ${idClasse}`;
      whereClause = 'WHERE f.idClasse = ? AND f.idAcademi = ?';
      params = [idClasse, idAnnee];
    }

    // Get students in this class/salle
    const [eleves] = await pool.query(
      `SELECT DISTINCT CAST(e.matricule AS CHAR) AS matricule, e.nom, e.prenom, e.photoURL, e.dateNaissance, e.sexe
       FROM Eleve e
       LEFT JOIN Frequente f ON CAST(f.matricule AS CHAR) = CAST(e.matricule AS CHAR)
       LEFT JOIN Classe cl ON cl.idClasse = f.idClasse
       LEFT JOIN Salle s ON s.idSalle = cl.idSalle
       ${whereClause}
       ORDER BY e.nom, e.prenom`,
      params
    );

    if (!eleves || eleves.length === 0) {
      return res.status(404).json({ error: 'Aucun élève trouvé pour la sélection' });
    }

    const effectif = eleves.length;

    // Compute all student averages for ranking
    const studentAverages = [];
    const studentEvals = {};

    for (const el of eleves) {
      const [evaluations] = await pool.query(
        `SELECT ev.note, ev.appreciation, c.libelle AS cours, c.coefficient,
                s2.libelle AS session
         FROM Evaluation ev
         LEFT JOIN Cours c ON c.idCours = ev.idCours
         LEFT JOIN Session s2 ON s2.idSession = ev.idSession
         LEFT JOIN Trimestre t ON t.idTrimes = s2.idTrimestre
         WHERE ev.matricule = ? AND t.idTrimes = ?
         ORDER BY c.libelle`,
        [el.matricule, idTrimes]
      );

      studentEvals[el.matricule] = evaluations;
      const avg = calculerMoyennePonderee(evaluations.map(e => ({ note: e.note, coefficient: e.coefficient || 1 })));
      studentAverages.push({ matricule: el.matricule, moyenne: avg });
    }

    // Sort by average for ranking
    studentAverages.sort((a, b) => b.moyenne - a.moyenne);
    const allAvg = studentAverages.map(s => s.moyenne).filter(m => m > 0);
    const moyenneClasse = allAvg.length > 0 ? parseFloat((allAvg.reduce((a, b) => a + b, 0) / allAvg.length).toFixed(2)) : 0;

    // --- Persist the generated bulletins into the database ---
    const idAdmin = req.user?.id || 1000;
    for (const el of eleves) {
      const evaluations = studentEvals[el.matricule] || [];
      const avgInfo = studentAverages.find(s => String(s.matricule) === String(el.matricule));
      const moyenneGenerale = avgInfo ? avgInfo.moyenne : 0;
      
      // Check if bulletin already exists
      const [existing] = await pool.query(
        'SELECT idBulletin FROM Bulletin WHERE matricule = ? AND idTrimes = ? AND idAnnee = ?',
        [el.matricule, idTrimes, idAnnee]
      );
      
      let bulletinId = null;
      if (existing.length > 0) {
        bulletinId = existing[0].idBulletin;
        // Update general average and date
        await pool.query(
          'UPDATE Bulletin SET moyenneGenerale = ?, dateGeneration = NOW() WHERE idBulletin = ?',
          [moyenneGenerale, bulletinId]
        );
        // Clear old details to re-insert
        await pool.query('DELETE FROM BulletinDetail WHERE idBulletin = ?', [bulletinId]);
      } else {
        // Create new bulletin
        const generalAppreciation = obtenirAppreciation(moyenneGenerale);
        const [resBull] = await pool.query(`
          INSERT INTO Bulletin (matricule, idAnnee, idTrimes, appreciation, idPers, statut, dateGeneration, moyenneGenerale)
          VALUES (?, ?, ?, ?, ?, 'brouillon', NOW(), ?)
        `, [el.matricule, idAnnee, idTrimes, generalAppreciation, idAdmin, moyenneGenerale]);
        bulletinId = resBull.insertId;
      }
      
      // Insert details
      if (evaluations.length > 0) {
        for (const ev of evaluations) {
          const appre = ev.appreciation || obtenirAppreciation(ev.note);
          await pool.query(`
            INSERT INTO BulletinDetail (idBulletin, idCours, libelleCours, note, appreciation, coefficient)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [bulletinId, ev.idCours || null, ev.cours || 'Matière inconnue', ev.note || 0, appre, ev.coefficient || 1]);
        }
      }
    }

    // Generate HTML
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Bulletins ${selectionValue}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; }
      .bulletin { page-break-after: always; padding: 24px 32px; }
      .bulletin:last-child { page-break-after: auto; }
      .header-top { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1a1a2e; padding-bottom: 14px; margin-bottom: 16px; }
      .school-name { font-size: 20px; font-weight: 800; color: #1a1a2e; }
      .school-sub { font-size: 11px; color: #555; }
      .bulletin-title { text-align: center; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #1a1a2e; margin: 12px 0; padding: 8px; background: #f0f4ff; border-radius: 6px; }
      .student-info { display: flex; gap: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
      .student-photo { width: 72px; height: 90px; border-radius: 6px; object-fit: cover; border: 2px solid #ddd; background: #f1f5f9; }
      .student-photo-placeholder { width: 72px; height: 90px; border-radius: 6px; border: 2px solid #ddd; background: linear-gradient(135deg,#667eea,#764ba2); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 800; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; font-size: 12px; flex: 1; }
      .info-grid .label { color: #666; font-weight: 600; }
      .info-grid .value { color: #1a1a2e; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
      th { background: #1a1a2e; color: #fff; padding: 8px 6px; text-align: center; font-weight: 700; font-size: 11px; text-transform: uppercase; }
      td { border: 1px solid #ddd; padding: 7px 6px; text-align: center; }
      .cours-name { text-align: left !important; font-weight: 600; }
      .note-good { color: #059669; font-weight: 700; }
      .note-avg { color: #d97706; font-weight: 700; }
      .note-bad { color: #dc2626; font-weight: 700; }
      .stats-row { display: flex; gap: 16px; margin-top: 14px; }
      .stat-card { flex: 1; padding: 12px; border-radius: 8px; text-align: center; }
      .stat-card .stat-value { font-size: 22px; font-weight: 800; }
      .stat-card .stat-label { font-size: 10px; color: #555; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
      .appreciation-box { margin-top: 14px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; }
      .appreciation-box .title { font-weight: 700; margin-bottom: 4px; }
      @media print {
        .bulletin { padding: 16px; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style></head><body>`;

    for (const el of eleves) {
      const evaluations = studentEvals[el.matricule] || [];
      const details = evaluations.map(e => ({ note: e.note, coefficient: e.coefficient || 1 }));
      const moyenne = calculerMoyennePonderee(details);
      const rang = studentAverages.findIndex(s => String(s.matricule) === String(el.matricule)) + 1;
      const initials = ((el.prenom || '')[0] || '') + ((el.nom || '')[0] || '');

      html += `<div class="bulletin">`;
      html += `<div class="header-top">
        <div><div class="school-name">Établissement Scolaire</div><div class="school-sub">Année: ${anneeRow?.libelle || ''}</div></div>
        <div style="text-align:right"><div style="font-size:13px;font-weight:700">BULLETIN DE NOTES</div><div class="school-sub">${trimestreRow?.libelle || ''}</div></div>
      </div>`;

      html += `<div class="bulletin-title">Bulletin du ${trimestreRow?.libelle || 'Trimestre'}</div>`;

      // Student info
      html += `<div class="student-info">`;
      if (el.photoURL) {
        html += `<img class="student-photo" src="${el.photoURL}" alt="" />`;
      } else {
        html += `<div class="student-photo-placeholder">${initials.toUpperCase()}</div>`;
      }
      html += `<div class="info-grid">
        <span class="label">Nom :</span><span class="value">${el.nom || ''}</span>
        <span class="label">Prénom :</span><span class="value">${el.prenom || ''}</span>
        <span class="label">Matricule :</span><span class="value">${el.matricule}</span>
        <span class="label">Date naissance :</span><span class="value">${el.dateNaissance ? new Date(el.dateNaissance).toLocaleDateString('fr-FR') : '—'}</span>
        <span class="label">${selectionLabel} :</span><span class="value">${selectionValue}</span>
        <span class="label">Sexe :</span><span class="value">${el.sexe == 1 ? 'Masculin' : 'Féminin'}</span>
      </div></div>`;

      // Notes table
      html += `<table><thead><tr>
        <th style="width:30%;text-align:left">Matière</th>
        <th style="width:10%">Coeff</th>
        <th style="width:12%">Note /20</th>
        <th style="width:12%">Note×Coeff</th>
        <th style="width:10%">Grade</th>
        <th style="width:26%">Appréciation</th>
      </tr></thead><tbody>`;

      if (evaluations.length === 0) {
        html += `<tr><td colspan="6" style="text-align:center;color:#999;padding:20px">Aucune évaluation enregistrée pour ce trimestre</td></tr>`;
      } else {
        let totalCoeff = 0;
        let totalPoints = 0;
        evaluations.forEach(ev => {
          const note = ev.note !== null && ev.note !== undefined ? Number(ev.note) : null;
          const coeff = parseFloat(ev.coefficient) || 1;
          const noteCoeff = note !== null ? (note * coeff).toFixed(1) : '';
          const grade = note !== null ? getGrade(note) : '';
          const noteClass = note === null ? '' : note >= 10 ? 'note-good' : note >= 7 ? 'note-avg' : 'note-bad';
          if (note !== null) { totalCoeff += coeff; totalPoints += note * coeff; }
          html += `<tr>
            <td class="cours-name">${ev.cours || ''}</td>
            <td>${coeff}</td>
            <td class="${noteClass}">${note !== null ? note.toFixed(1) : '—'}</td>
            <td>${noteCoeff}</td>
            <td>${grade}</td>
            <td style="text-align:left;font-size:11px">${ev.appreciation || obtenirAppreciation(note || 0)}</td>
          </tr>`;
        });
        html += `<tr style="background:#f8fafc;font-weight:700">
          <td class="cours-name">TOTAL</td>
          <td>${totalCoeff}</td>
          <td colspan="4" style="text-align:left;padding-left:12px">Points: ${totalPoints.toFixed(1)}</td>
        </tr>`;
      }

      html += `</tbody></table>`;

      // Stats row
      html += `<div class="stats-row">
        <div class="stat-card" style="background:#eff6ff;border:1px solid #bfdbfe">
          <div class="stat-value" style="color:#2563eb">${moyenne.toFixed(2)}/20</div>
          <div class="stat-label">Moyenne élève</div>
        </div>
        <div class="stat-card" style="background:#f0fdf4;border:1px solid #bbf7d0">
          <div class="stat-value" style="color:#059669">${rang}${rang === 1 ? 'er' : 'ème'}</div>
          <div class="stat-label">Rang / ${effectif}</div>
        </div>
        <div class="stat-card" style="background:#fefce8;border:1px solid #fde68a">
          <div class="stat-value" style="color:#d97706">${moyenneClasse.toFixed(2)}/20</div>
          <div class="stat-label">Moyenne classe</div>
        </div>
        <div class="stat-card" style="background:#faf5ff;border:1px solid #e9d5ff">
          <div class="stat-value" style="color:#7c3aed">${effectif}</div>
          <div class="stat-label">Effectif</div>
        </div>
      </div>`;

      // Appreciation
      html += `<div class="appreciation-box">
        <div class="title">Appréciation du conseil de classe</div>
        <div>${obtenirAppreciation(moyenne)} — ${moyenne >= 10 ? 'Admis(e)' : 'Doit redoubler ses efforts'}</div>
      </div>`;

      html += `</div>`;
    }

    html += `</body></html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error) {
    console.error('generateClassBulletins error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
