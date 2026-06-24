const bcrypt = require('bcrypt');
const pool = require('../database/db');

async function seed() {
  try {
    const saltRounds = 10;

    // Insert Admin default
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    await pool.query(
      'INSERT INTO Admin (nom, username, password, actif, typeAdmin, mobile) VALUES (?, ?, ?, 1, 1, ?)',
      ['Admin', 'admin', adminPassword, '0000000000']
    );

    // Seed base data
    const [cycleRows] = await pool.query('INSERT INTO Cycle (libelle, description, idAdmin) VALUES ?',[ [
      ['Cycle 1', 'Cycle primaire', 1],
      ['Cycle 2', 'Cycle secondaire', 1]
    ]]);

    const [classeRows] = await pool.query('INSERT INTO Classe (libelle, idCycle, idAdmin) VALUES ?',[ [
      ['6ème A', 1, 1],
      ['5ème B', 1, 1],
      ['4ème A', 2, 1],
      ['3ème B', 2, 1]
    ]]);

    const [salleRows] = await pool.query('INSERT INTO Salle (libelle, position, surface, idClasse, actif, idAdmin) VALUES ?',[ [
      ['Salle 101', 'Nord', '50m2', 1, 1, 1],
      ['Salle 102', 'Est', '45m2', 2, 1, 1],
      ['Salle 201', 'Ouest', '55m2', 3, 1, 1]
    ]]);

    const [bookRows] = await pool.query('INSERT INTO Specialite (libelle, idAdmin) VALUES ?',[ [
      ['Mathématiques', 1],
      ['Sciences', 1],
      ['Langues', 1]
    ]]);

    const [livreRows] = await pool.query('INSERT INTO Livres (titre, auteurs, prix, idSpecialite, edition, annee_parution, idAdmin) VALUES ?',[ [
      ['Maths 1', 'Auteur A', 45.0, 1, '1ère', 2024, 1],
      ['Physique 1', 'Auteur B', 40.0, 2, '2ème', 2023, 1],
      ['Français 1', 'Auteur C', 35.0, 3, '1ère', 2024, 1]
    ]]);

    const [coursRows] = await pool.query('INSERT INTO Cours (libelle, note, coefficient, description, idLivre, actif, idAdmin) VALUES ?',[ [
      ['Mathématiques', 20, 2.0, 'Cours de maths', 1, 1, 1],
      ['Physique', 20, 1.5, 'Cours de physique', 2, 1, 1],
      ['Français', 20, 1.0, 'Cours de français', 3, 1, 1],
      ['Histoire', 20, 1.0, 'Cours d histoire', NULL, 1, 1],
      ['Anglais', 20, 1.0, 'Cours d anglais', NULL, 1, 1]
    ]]);

    const [anneeRows] = await pool.query('INSERT INTO AnneeAcademique (libelle, periode, idAdmin) VALUES ?',[ [
      ['2025-2026', 'Septembre - Juin', 1]
    ]]);

    const [trimRows] = await pool.query('INSERT INTO Trimestre (libelle, periode, idAca, idAdmin) VALUES ?',[ [
      ['Trimestre 1', 'Septembre - Décembre', 1, 1]
    ]]);

    const [sessionRows] = await pool.query('INSERT INTO Session (libelle, description, idTrimestre, idPers) VALUES ?',[ [
      ['Session 1', 'Session initiale', 1, 1]
    ]]);

    const [villeRows] = await pool.query('INSERT INTO VilleNaissance (libelle, actif) VALUES ?',[ [
      ['Dakar', 1],
      ['Tunis', 1]
    ]]);

    const [eleveRows] = await pool.query('INSERT INTO Eleve (matricule, nom, prenom, dateNaissance, lieuNaissance, sexe, langue, photoURL, actif, idVilleNaissance, idAdmin) VALUES ?',[ [
      ['E1001', 'Dia', 'Awa', '2012-01-10', 'Dakar', 2, 'Francais', '', 1, 1, 1],
      ['E1002', 'Ndiaye', 'Mamadou', '2011-03-15', 'Dakar', 1, 'Francais', '', 1, 1, 1],
      ['E1003', 'Sarr', 'Fatou', '2012-05-20', 'Dakar', 2, 'Francais', '', 1, 1, 1],
      ['E1004', 'Ba', 'Ali', '2011-07-12', 'Dakar', 1, 'Francais', '', 1, 1, 1],
      ['E1005', 'Fall', 'Amina', '2012-09-22', 'Dakar', 2, 'Francais', '', 1, 1, 1],
      ['E1006', 'Kane', 'Ibrahima', '2012-11-02', 'Dakar', 1, 'Francais', '', 1, 1, 1],
      ['E1007', 'Lo', 'Aissatou', '2011-12-27', 'Dakar', 2, 'Francais', '', 1, 1, 1],
      ['E1008', 'Thiam', 'Ousmane', '2012-02-15', 'Dakar', 1, 'Francais', '', 1, 1, 1],
      ['E1009', 'Diallo', 'Nene', '2012-04-06', 'Dakar', 2, 'Francais', '', 1, 1, 1],
      ['E1010', 'Ciss', 'Moussa', '2011-06-30', 'Dakar', 1, 'Francais', '', 1, 1, 1]
    ]]);

    const [freqRows] = await pool.query('INSERT INTO Frequente (idSalle, idAcademi, matricule, commentaire, idAdmin) VALUES ?',[ [
      [1, 1, 'E1001', 'Inscrit 6ème', 1],
      [1, 1, 'E1002', 'Inscrit 6ème', 1],
      [2, 1, 'E1003', 'Inscrit 5ème', 1],
      [2, 1, 'E1004', 'Inscrit 5ème', 1],
      [3, 1, 'E1005', 'Inscrit 4ème', 1],
      [3, 1, 'E1006', 'Inscrit 4ème', 1],
      [3, 1, 'E1007', 'Inscrit 4ème', 1],
      [1, 1, 'E1008', 'Inscrit 6ème', 1],
      [2, 1, 'E1009', 'Inscrit 5ème', 1],
      [3, 1, 'E1010', 'Inscrit 4ème', 1]
    ]]);

    const [personneRows] = await pool.query('INSERT INTO Personne (idPers, nom, prenom, dateNaissance, lieuNaissance, mobile, phone, typePersonne, username, password, idAdmin) VALUES ?',[ [
      [1001, 'Piqure', 'Enseignant', '1985-03-10', 'Dakar', '770000000', '', 2, 'piqure', await bcrypt.hash('1234', saltRounds), 1]
    ]]);

    await pool.query('INSERT INTO Enseignant (idPers, idCours, Actif, idAdmin) VALUES (?, ?, 1, 1)', [1001, 1]);

    const [modeRows] = await pool.query('INSERT INTO Mode (libelle, information, actif) VALUES ?',[ [
      ['Espèces', 'Paiement en espèces', 1],
      ['Virement bancaire', 'Paiement par virement', 1],
      ['Mobile money', 'Paiement mobile', 1]
    ]]);

    console.log('Seed terminé');
    process.exit(0);
  } catch (error) {
    console.error('Erreur seed :', error);
    process.exit(1);
  }
}

seed();
