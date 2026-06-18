const pool = require('../database/db');

async function seed() {
  try {
    console.log('Seeding demo data...');

    // Ensure groups table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS MessageGroups (
        idGroup INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        description TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS GroupMessages (
        idMsg INT AUTO_INCREMENT PRIMARY KEY,
        groupId INT NOT NULL,
        senderRole VARCHAR(30) NULL,
        senderId VARCHAR(120) NULL,
        senderLabel VARCHAR(160) NULL,
        content TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (groupId) REFERENCES MessageGroups(idGroup) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Insert sample groups
    const [existing] = await pool.query('SELECT COUNT(*) as c FROM MessageGroups');
    if (existing[0].c === 0) {
      await pool.query('INSERT INTO MessageGroups (name, description) VALUES (?, ?)', ['Groupe test - Parents', 'Groupe de démonstration pour parents']);
      await pool.query('INSERT INTO MessageGroups (name, description) VALUES (?, ?)', ['Groupe test - Enseignants', 'Groupe de démonstration pour enseignants']);
      console.log('Inserted sample groups');
    }

    // Insert sample group messages
    const [groups] = await pool.query('SELECT idGroup FROM MessageGroups LIMIT 2');
    for (const g of groups) {
      const [msgs] = await pool.query('SELECT COUNT(*) as c FROM GroupMessages WHERE groupId = ?', [g.idGroup]);
      if (msgs[0].c === 0) {
        await pool.query('INSERT INTO GroupMessages (groupId, senderRole, senderId, senderLabel, content) VALUES (?, ?, ?, ?, ?)', [g.idGroup, 'admin', 'seed-admin', 'Admin Seed', 'Bienvenue dans le groupe de démonstration.']);
      }
    }

    // Emploi du temps sample
    await pool.query(`
      CREATE TABLE IF NOT EXISTS EmploiDuTemps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        jour VARCHAR(40) NOT NULL,
        heure_debut VARCHAR(16) NOT NULL,
        heure_fin VARCHAR(16) NOT NULL,
        matiere VARCHAR(160) NOT NULL,
        professeur VARCHAR(160) NULL,
        salle VARCHAR(80) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [edtCount] = await pool.query('SELECT COUNT(*) as c FROM EmploiDuTemps');
    if (edtCount[0].c === 0) {
      await pool.query('INSERT INTO EmploiDuTemps (jour, heure_debut, heure_fin, matiere, professeur, salle) VALUES (?, ?, ?, ?, ?, ?)', ['Lundi', '08:00', '09:00', 'Mathématiques', 'Mme Dupont', 'Salle 101']);
      await pool.query('INSERT INTO EmploiDuTemps (jour, heure_debut, heure_fin, matiere, professeur, salle) VALUES (?, ?, ?, ?, ?, ?)', ['Lundi', '09:15', '10:15', 'Français', 'M. Martin', 'Salle 102']);
      console.log('Inserted sample emploi du temps');
    }

    console.log('Seed terminé');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
