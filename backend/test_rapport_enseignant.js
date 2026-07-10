const pool = require('./database/db');

async function testCreateRapportEnseignant() {
  try {
    console.log('🧪 Test de création de rapport pour ENSEIGNANT\n');
    
    // Vérifier s'il y a des enseignants
    const [enseignants] = await pool.query('SELECT idEnseignant FROM Enseignant LIMIT 1');
    if (enseignants.length === 0) {
      console.log('❌ Pas d\'enseignants dans la base');
      process.exit(1);
    }
    
    const idEnseignant = enseignants[0].idEnseignant;
    console.log(`✅ Enseignant trouvé: ID ${idEnseignant}`);
    
    // Créer la table Rapports si elle n'existe pas
    console.log('\n📋 Vérification de la table Rapports...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Rapports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference VARCHAR(60) NOT NULL,
        categorie VARCHAR(60) NOT NULL,
        idEnseignant INT NULL,
        idEleve VARCHAR(60) NULL,
        titre VARCHAR(255) NOT NULL,
        details TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Table Rapports vérifiée');
    
    // Test de création
    console.log('\n📝 Tentative de création d\'un rapport enseignant...\n');
    
    const ref = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const [result] = await pool.query(
      'INSERT INTO Rapports (reference, categorie, idEnseignant, titre, details, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [ref, 'Pédagogique', idEnseignant, 'Test rapport enseignant', 'Ceci est un test']
    );
    
    console.log('✅ Rapport créé avec succès!');
    console.log(`   ID: ${result.insertId}`);
    console.log(`   Référence: ${ref}`);
    
    // Vérifier le rapport
    const [rapport] = await pool.query('SELECT * FROM Rapports WHERE id = ?', [result.insertId]);
    console.log('\n📄 Rapport inséré:');
    console.log(rapport[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  }
}

testCreateRapportEnseignant();
