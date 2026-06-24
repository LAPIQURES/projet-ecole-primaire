const pool = require('../database/db');

(async function(){
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Poste (
        idPoste INT AUTO_INCREMENT PRIMARY KEY,
        libelle VARCHAR(200) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT NOW()
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Fonction (
        idFonction INT AUTO_INCREMENT PRIMARY KEY,
        libelle VARCHAR(200) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT NOW()
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Personnel (
        idPersonnel INT AUTO_INCREMENT PRIMARY KEY,
        idPers INT NOT NULL,
        idPoste INT NULL,
        idFonction INT NULL,
        dateDebut DATE NULL,
        dateFin DATE NULL,
        actif TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT NOW(),
        FOREIGN KEY (idPers) REFERENCES Personne(idPers) ON DELETE CASCADE,
        FOREIGN KEY (idPoste) REFERENCES Poste(idPoste) ON DELETE SET NULL,
        FOREIGN KEY (idFonction) REFERENCES Fonction(idFonction) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Tables Poste, Fonction et Personnel créées ou déjà existantes');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message || err);
    process.exit(1);
  }
})();
