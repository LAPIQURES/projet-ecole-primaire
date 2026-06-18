const pool = require('../database/db');

async function createBulletinsTables() {
  try {
    console.log('📋 Création des tables Bulletins et Discipline...');

    // Table Bulletins - Stock les bulletins générés
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Bulletin (
        idBulletin INT AUTO_INCREMENT PRIMARY KEY,
        matricule VARCHAR(50) NOT NULL,
        idAnnee INT NOT NULL,
        idTrimes INT NOT NULL,
        dateGeneration DATETIME DEFAULT CURRENT_TIMESTAMP,
        statut ENUM('brouillon', 'finalisé', 'publié') DEFAULT 'brouillon',
        moyenneGenerale DECIMAL(5,2) NULL,
        rangClasse INT NULL,
        effectifClasse INT NULL,
        appreciation TEXT NULL,
        idPers INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_bulletin (matricule, idAnnee, idTrimes),
        FOREIGN KEY (matricule) REFERENCES Eleve(matricule) ON DELETE CASCADE,
        FOREIGN KEY (idAnnee) REFERENCES AnneeAcademique(idAnnee),
        FOREIGN KEY (idTrimes) REFERENCES Trimestre(idTrimes),
        FOREIGN KEY (idPers) REFERENCES Personne(idPers)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Table Bulletin créée');

    // Table BulletinDetail - Détails des notes par matière/cours
    await pool.query(`
      CREATE TABLE IF NOT EXISTS BulletinDetail (
        idDetail INT AUTO_INCREMENT PRIMARY KEY,
        idBulletin INT NOT NULL,
        idCours INT NOT NULL,
        libelleCours VARCHAR(160),
        note DECIMAL(5,2) NULL,
        appreciation VARCHAR(100) NULL,
        appreciation_long TEXT NULL,
        coefficient DECIMAL(3,1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idBulletin) REFERENCES Bulletin(idBulletin) ON DELETE CASCADE,
        FOREIGN KEY (idCours) REFERENCES Cours(idCours)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Table BulletinDetail créée');

    // Table DisciplineLog - Enregistrement des problèmes de discipline
    await pool.query(`
      CREATE TABLE IF NOT EXISTS DisciplineLog (
        idDiscipline INT AUTO_INCREMENT PRIMARY KEY,
        matricule VARCHAR(50) NOT NULL,
        idAnnee INT NOT NULL,
        type ENUM('absence', 'retard', 'infraction', 'convocation', 'avertissement', 'renvoi', 'autre') DEFAULT 'infraction',
        libelle VARCHAR(200) NOT NULL,
        description TEXT,
        dateEvenement DATE NOT NULL,
        nombreHeures INT DEFAULT 0,
        nombreJours INT DEFAULT 0,
        nombreAbsences INT DEFAULT 0,
        nombreConvocations INT DEFAULT 0,
        motivation TEXT NULL,
        gravite ENUM('léger', 'moyen', 'grave') DEFAULT 'moyen',
        punition VARCHAR(255) NULL,
        idPersEnregistrement INT,
        dateEnregistrement DATETIME DEFAULT CURRENT_TIMESTAMP,
        statut ENUM('enregistré', 'résolu', 'ignoré') DEFAULT 'enregistré',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (matricule) REFERENCES Eleve(matricule) ON DELETE CASCADE,
        FOREIGN KEY (idAnnee) REFERENCES AnneeAcademique(idAnnee),
        FOREIGN KEY (idPersEnregistrement) REFERENCES Personne(idPers)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Table DisciplineLog créée');

    // Table ParentNotification - Pour notifier les parents des problèmes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ParentNotification (
        idNotif INT AUTO_INCREMENT PRIMARY KEY,
        matricule VARCHAR(50) NOT NULL,
        type ENUM('discipline', 'résultat', 'absence', 'paiement') DEFAULT 'discipline',
        titre VARCHAR(200),
        message TEXT,
        dateNotif DATETIME DEFAULT CURRENT_TIMESTAMP,
        lu BOOLEAN DEFAULT FALSE,
        idPers INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (matricule) REFERENCES Eleve(matricule) ON DELETE CASCADE,
        FOREIGN KEY (idPers) REFERENCES Personne(idPers)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Table ParentNotification créée');

    console.log('✅ Toutes les tables ont été créées avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error.message);
    process.exit(1);
  }
}

createBulletinsTables();
