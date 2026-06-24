const pool = require('../database/db');
(async () => {
  try {
    const [cycles] = await pool.query('SELECT idCycle, libelle FROM Cycle');
    console.log('CYCLES', cycles);
    const [classes] = await pool.query('SELECT idClasse, libelle, idCycle FROM Classe');
    console.log('CLASSES', classes);
    const [create] = await pool.query('SHOW CREATE TABLE Classe');
    console.log('CLASS CREATE', create[0]['Create Table']);
    const [createLivres] = await pool.query('SHOW CREATE TABLE Livres');
    console.log('LIVRES CREATE', createLivres[0]['Create Table']);
    const [createAnnee] = await pool.query('SHOW CREATE TABLE AnneeAcademique');
    console.log('ANNEEACADEMIQUE CREATE', createAnnee[0]['Create Table']);
    const [createTrimestre] = await pool.query('SHOW CREATE TABLE Trimestre');
    console.log('TRIMESTRE CREATE', createTrimestre[0]['Create Table']);
    const [createSession] = await pool.query('SHOW CREATE TABLE Session');
    console.log('SESSION CREATE', createSession[0]['Create Table']);
    const [createFrequente] = await pool.query('SHOW CREATE TABLE Frequente');
    console.log('FREQUENTE CREATE', createFrequente[0]['Create Table']);
    const [createAdmin] = await pool.query('SHOW CREATE TABLE Admin');
    console.log('ADMIN CREATE', createAdmin[0]['Create Table']);
    const [createPersonne] = await pool.query('SHOW CREATE TABLE Personne');
    console.log('PERSONNE CREATE', createPersonne[0]['Create Table']);
    const [createEnseignant] = await pool.query('SHOW CREATE TABLE Enseignant');
    console.log('ENSEIGNANT CREATE', createEnseignant[0]['Create Table']);
    const [createParents] = await pool.query('SHOW CREATE TABLE Parents');
    console.log('PARENTS CREATE', createParents[0]['Create Table']);
    const [createMode] = await pool.query('SHOW CREATE TABLE Mode');
    console.log('MODE CREATE', createMode[0]['Create Table']);
    const [createSalle] = await pool.query('SHOW CREATE TABLE Salle');
    console.log('SALLE CREATE', createSalle[0]['Create Table']);
    const [admin] = await pool.query('SELECT ID, login, username, typeAdmin, actif FROM Admin LIMIT 5');
    console.log('ADMINS', admin);
  } catch (error) {
    console.error('ERROR', error.message || error);
  } finally {
    process.exit(0);
  }
})();