const bcrypt = require('bcrypt');
const pool = require('../database/db');

async function findOrCreateCycle(libelle, description, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idCycle FROM Cycle WHERE libelle = ? LIMIT 1', [libelle]);
  if (rows.length > 0) return rows[0].idCycle;
  const [result] = await pool.query('INSERT INTO Cycle (libelle, description, idAdmin) VALUES (?, ?, ?)', [libelle, description, idAdmin]);
  return result.insertId;
}

async function findOrCreateClasse(libelle, idCycle, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idClasse FROM Classe WHERE libelle = ? LIMIT 1', [libelle]);
  if (rows.length > 0) return rows[0].idClasse;
  const [result] = await pool.query('INSERT INTO Classe (libelle, idCycle, idAdmin) VALUES (?, ?, ?)', [libelle, idCycle, idAdmin]);
  return result.insertId;
}

async function findOrCreateSalle(libelle, position, surface, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idSalle FROM Salle WHERE libelle = ? LIMIT 1', [libelle]);
  if (rows.length > 0) return rows[0].idSalle;
  const [result] = await pool.query('INSERT INTO Salle (libelle, position, surface, actif, idAdmin) VALUES (?, ?, ?, 1, ?)', [libelle, position, surface, idAdmin]);
  return result.insertId;
}

async function findOrCreateSpecialite(libelle, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idSpecialite FROM Specialite WHERE libelle = ? LIMIT 1', [libelle]);
  if (rows.length > 0) return rows[0].idSpecialite;
  const [result] = await pool.query('INSERT INTO Specialite (libelle, idAdmin) VALUES (?, ?)', [libelle, idAdmin]);
  return result.insertId;
}

async function findOrCreateLivre(titre, auteurs, prix, idSpecialite, edition, annee_parution, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idLivre FROM Livres WHERE titre = ? LIMIT 1', [titre]);
  if (rows.length > 0) return rows[0].idLivre;
  const [result] = await pool.query('INSERT INTO Livres (titre, auteurs, prix, idSpecialite, edition, annee_parution, idAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)', [titre, auteurs, prix, idSpecialite, edition, annee_parution, idAdmin]);
  return result.insertId;
}

async function findOrCreateCours(libelle, note, coefficient, description, idClasse, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idCours FROM Cours WHERE libelle = ? LIMIT 1', [libelle]);
  if (rows.length > 0) return rows[0].idCours;
  const [result] = await pool.query('INSERT INTO Cours (libelle, note, coefficient, description, idClasse, actif, idAdmin) VALUES (?, ?, ?, ?, ?, 1, ?)', [libelle, note, coefficient, description, idClasse, idAdmin]);
  return result.insertId;
}

async function findOrCreateAnneeAcademique(libelle, periode, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idAnnee FROM AnneeAcademique WHERE libelle = ? LIMIT 1', [libelle]);
  if (rows.length > 0) return rows[0].idAnnee;
  const [result] = await pool.query('INSERT INTO AnneeAcademique (libelle, periode, created_at, idAdmin) VALUES (?, ?, CURDATE(), ?)', [libelle, periode, idAdmin]);
  return result.insertId;
}

async function findOrCreateTrimestre(libelle, periode, idAca, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idTrimes FROM Trimestre WHERE libelle = ? AND idAca = ? LIMIT 1', [libelle, idAca]);
  if (rows.length > 0) return rows[0].idTrimes;
  const [result] = await pool.query('INSERT INTO Trimestre (libelle, periode, idAca, idAdmin) VALUES (?, ?, ?, ?)', [libelle, periode, idAca, idAdmin]);
  return result.insertId;
}

async function findOrCreateSession(libelle, description, idTrimestre, idPers, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idSession FROM Session WHERE libelle = ? AND idTrimestre = ? LIMIT 1', [libelle, idTrimestre]);
  if (rows.length > 0) return rows[0].idSession;
  const [result] = await pool.query('INSERT INTO Session (libelle, description, idTrimestre, idPers) VALUES (?, ?, ?, ?)', [libelle, description, idTrimestre, idPers]);
  return result.insertId;
}

async function findOrCreateVilleNaissance(libelle, actif = 1) {
  const [rows] = await pool.query('SELECT idVilleNaissance FROM VilleNaissance WHERE libelle = ? LIMIT 1', [libelle]);
  if (rows.length > 0) return rows[0].idVilleNaissance;
  const [result] = await pool.query('INSERT INTO VilleNaissance (libelle, actif) VALUES (?, ?)', [libelle, actif]);
  return result.insertId;
}

async function findOrCreateEleve(matricule, nom, prenom, dateNaissance, lieuNaissance, sexe, langue, photoURL, actif, idVilleNaissance, idAdmin = 1) {
  const [rows] = await pool.query('SELECT matricule FROM Eleve WHERE matricule = ? LIMIT 1', [matricule]);
  if (rows.length > 0) return rows[0].matricule;
  const [result] = await pool.query('INSERT INTO Eleve (matricule, nom, prenom, dateNaissance, lieuNaissance, sexe, langue, photoURL, actif, idVilleNaissance, idAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [matricule, nom, prenom, dateNaissance, lieuNaissance, sexe, langue, photoURL, actif, idVilleNaissance, idAdmin]);
  return result.insertId || matricule;
}

async function findOrCreateFrequente(idClasse, idAcademi, matricule, commentaire, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idFrequente FROM Frequente WHERE idClasse = ? AND idAcademi = ? AND matricule = ? LIMIT 1', [idClasse, idAcademi, matricule]);
  if (rows.length > 0) return rows[0].idFrequente;
  const [result] = await pool.query('INSERT INTO Frequente (idClasse, idAcademi, matricule, commentaire, idAdmin) VALUES (?, ?, ?, ?, ?)', [idClasse, idAcademi, matricule, commentaire, idAdmin]);
  return result.insertId;
}

async function findOrCreateMode(libelle, information, actif = 1, idFondateur = 1) {
  const [rows] = await pool.query('SELECT idMode FROM Mode WHERE libelle = ? LIMIT 1', [libelle]);
  if (rows.length > 0) return rows[0].idMode;
  const [result] = await pool.query('INSERT INTO Mode (libelle, information, actif, idFondateur) VALUES (?, ?, ?, ?)', [libelle, information, actif, idFondateur]);
  return result.insertId;
}

async function findOrCreatePersonne(idPers, nom, prenom, dateNaissance, lieuNaissance, mobile, phone, typePersonne, username, password, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idPers FROM Personne WHERE username = ? LIMIT 1', [username]);
  if (rows.length > 0) {
    await pool.query('UPDATE Personne SET nom = ?, prenom = ?, dateNaissance = ?, lieuNaissance = ?, mobile = ?, phone = ?, typePersonne = ?, password = ?, idAdmin = ? WHERE username = ?', [nom, prenom, dateNaissance, lieuNaissance, mobile, phone, typePersonne, password, idAdmin, username]);
    return rows[0].idPers;
  }
  const [result] = await pool.query('INSERT INTO Personne (idPers, nom, prenom, dateNaissance, lieuNaissance, mobile, phone, typePersonne, username, password, idAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [idPers, nom, prenom, dateNaissance, lieuNaissance, mobile, phone, typePersonne, username, password, idAdmin]);
  return idPers;
}

async function findOrCreateEnseignant(idPers, idCours, actif = 1, idAdmin = 1) {
  const [rows] = await pool.query('SELECT idEnseignant FROM Enseignant WHERE idPers = ? LIMIT 1', [idPers]);
  if (rows.length > 0) {
    await pool.query('UPDATE Enseignant SET idCours = ?, Actif = ?, idAdmin = ? WHERE idPers = ?', [idCours, actif, idAdmin, idPers]);
    return rows[0].idEnseignant;
  }
  const [result] = await pool.query('INSERT INTO Enseignant (idPers, idCours, Actif, idAdmin) VALUES (?, ?, ?, ?)', [idPers, idCours, actif, idAdmin]);
  return result.insertId;
}

async function seed() {
  try {
    const saltRounds = 10;
    console.log('Seeding demo data...');

    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    await pool.query(
      'INSERT INTO Admin (login, username, password, typeAdmin, actif, isDelete, createdAt, updatedAt, langue) VALUES (?, ?, ?, 1, 1, 0, NOW(), NOW(), ?) ON DUPLICATE KEY UPDATE password = VALUES(password), typeAdmin = VALUES(typeAdmin), actif = VALUES(actif), isDelete = VALUES(isDelete), updatedAt = NOW(), langue = VALUES(langue)',
      ['admin', 'admin', adminPassword, 'fr']
    );
    console.log('✓ Admin account ready');

    const cycle1Id = await findOrCreateCycle('Cycle 1', 'Cycle primaire');
    const cycle2Id = await findOrCreateCycle('Cycle 2', 'Cycle secondaire');

    const classe1Id = await findOrCreateClasse('6ème A', cycle1Id);
    const classe2Id = await findOrCreateClasse('5ème B', cycle1Id);
    const classe3Id = await findOrCreateClasse('4ème A', cycle2Id);
    const classe4Id = await findOrCreateClasse('3ème B', cycle2Id);

    await findOrCreateSalle('Salle 101', 'Nord', '50m2');
    await findOrCreateSalle('Salle 102', 'Est', '45m2');
    await findOrCreateSalle('Salle 201', 'Ouest', '55m2');

    const specMathId = await findOrCreateSpecialite('Mathématiques');
    const specSciencesId = await findOrCreateSpecialite('Sciences');
    const specLanguesId = await findOrCreateSpecialite('Langues');

    const livreMathsId = await findOrCreateLivre('Maths 1', 'Auteur A', 45.0, specMathId, '1ère', '2024-01-01');
    const livrePhysiqueId = await findOrCreateLivre('Physique 1', 'Auteur B', 40.0, specSciencesId, '2ème', '2023-01-01');
    const livreFrancaisId = await findOrCreateLivre('Français 1', 'Auteur C', 35.0, specLanguesId, '1ère', '2024-01-01');

    const coursMathId = await findOrCreateCours('Mathématiques', 20, 2.0, 'Cours de maths', classe1Id);
    const coursPhysiqueId = await findOrCreateCours('Physique', 20, 1.5, 'Cours de physique', classe2Id);
    const coursFrancaisId = await findOrCreateCours('Français', 20, 1.0, 'Cours de français', classe3Id);
    const coursHistoireId = await findOrCreateCours('Histoire', 20, 1.0, "Cours d'histoire", classe4Id);
    const coursAnglaisId = await findOrCreateCours('Anglais', 20, 1.0, "Cours d'anglais", classe4Id);

    const anneeId = await findOrCreateAnneeAcademique('2025-2026', 'Septembre - Juin');
    const trimestreId = await findOrCreateTrimestre('Trimestre 1', 'Septembre - Décembre', anneeId);
    await findOrCreateSession('Session 1', 'Session initiale', trimestreId, 1);

    const dakarId = await findOrCreateVilleNaissance('Dakar');
    const tunisId = await findOrCreateVilleNaissance('Tunis');

    await findOrCreateEleve(1001, 'Dia', 'Awa', '2012-01-10', 'Dakar', 2, 'Francais', '', 1, dakarId);
    await findOrCreateEleve(1002, 'Ndiaye', 'Mamadou', '2011-03-15', 'Dakar', 1, 'Francais', '', 1, dakarId);
    await findOrCreateEleve(1003, 'Sarr', 'Fatou', '2012-05-20', 'Dakar', 2, 'Francais', '', 1, dakarId);
    await findOrCreateEleve(1004, 'Ba', 'Ali', '2011-07-12', 'Dakar', 1, 'Francais', '', 1, dakarId);
    await findOrCreateEleve(1005, 'Fall', 'Amina', '2012-09-22', 'Dakar', 2, 'Francais', '', 1, dakarId);
    await findOrCreateEleve(1006, 'Kane', 'Ibrahima', '2012-11-02', 'Dakar', 1, 'Francais', '', 1, dakarId);
    await findOrCreateEleve(1007, 'Lo', 'Aissatou', '2011-12-27', 'Dakar', 2, 'Francais', '', 1, dakarId);
    await findOrCreateEleve(1008, 'Thiam', 'Ousmane', '2012-02-15', 'Dakar', 1, 'Francais', '', 1, dakarId);
    await findOrCreateEleve(1009, 'Diallo', 'Nene', '2012-04-06', 'Dakar', 2, 'Francais', '', 1, dakarId);
    await findOrCreateEleve(1010, 'Ciss', 'Moussa', '2011-06-30', 'Dakar', 1, 'Francais', '', 1, dakarId);

    const idAcademi = anneeId;
    await findOrCreateFrequente(classe1Id, idAcademi, 1001, 'Inscrit 6ème');
    await findOrCreateFrequente(classe1Id, idAcademi, 1002, 'Inscrit 6ème');
    await findOrCreateFrequente(classe2Id, idAcademi, 1003, 'Inscrit 5ème');
    await findOrCreateFrequente(classe2Id, idAcademi, 1004, 'Inscrit 5ème');
    await findOrCreateFrequente(classe3Id, idAcademi, 1005, 'Inscrit 4ème');
    await findOrCreateFrequente(classe3Id, idAcademi, 1006, 'Inscrit 4ème');
    await findOrCreateFrequente(classe3Id, idAcademi, 1007, 'Inscrit 4ème');
    await findOrCreateFrequente(classe1Id, idAcademi, 1008, 'Inscrit 6ème');
    await findOrCreateFrequente(classe2Id, idAcademi, 1009, 'Inscrit 5ème');
    await findOrCreateFrequente(classe3Id, idAcademi, 1010, 'Inscrit 4ème');

    const piqurePassword = await bcrypt.hash('1234', saltRounds);
    const piqurePersId = await findOrCreatePersonne(1001, 'Piqure', 'Enseignant', '1985-03-10', 'Dakar', '770000000', '', 2, 'piqure', piqurePassword);

    await findOrCreateEnseignant(piqurePersId, coursMathId, 1);

    await findOrCreateMode('Espèces', 'Paiement en espèces');
    await findOrCreateMode('Virement bancaire', 'Paiement par virement');
    await findOrCreateMode('Mobile money', 'Paiement mobile');

    console.log('✅ Seed terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur seed :', error.message || error);
    process.exit(1);
  }
}

seed();
