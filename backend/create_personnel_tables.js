const m = require('mysql2/promise');
m.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'',database:'ecole2026'}).then(async c => {
  await c.query('DROP TABLE IF EXISTS Personnel');
  await c.query('DROP TABLE IF EXISTS Poste');
  await c.query('DROP TABLE IF EXISTS Fonction');
  await c.query(`CREATE TABLE IF NOT EXISTS Poste (idPoste INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, libelle VARCHAR(100) NOT NULL)`);
  await c.query(`CREATE TABLE IF NOT EXISTS Fonction (idFonction INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, libelle VARCHAR(100) NOT NULL)`);
  await c.query(`CREATE TABLE IF NOT EXISTS Personnel (
    idPersonnel INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    idPers INT UNSIGNED NOT NULL,
    idPoste INT UNSIGNED NULL,
    idFonction INT UNSIGNED NULL,
    dateDebut DATE NULL,
    dateFin DATE NULL,
    actif TINYINT(1) DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idPers) REFERENCES Personne(idPers) ON DELETE CASCADE,
    FOREIGN KEY (idPoste) REFERENCES Poste(idPoste) ON DELETE SET NULL,
    FOREIGN KEY (idFonction) REFERENCES Fonction(idFonction) ON DELETE SET NULL
  )`);
  await c.query(`INSERT IGNORE INTO Poste (libelle) VALUES ('Directeur'), ('Intendant'), ('Surveillant Général'), ('Secrétaire')`);
  await c.query(`INSERT IGNORE INTO Fonction (libelle) VALUES ('Administration'), ('Finances'), ('Discipline'), ('Accueil')`);
  console.log('Tables recreated');
  await c.end();
}).catch(console.error);
