const pool = require('./database/db');

async function addColumns() {
  try {
    console.log('Ajout des colonnes manquantes à la table Rapport...\n');
    
    // Ajouter la colonne libelle
    try {
      await pool.query('ALTER TABLE Rapport ADD COLUMN libelle VARCHAR(255) DEFAULT "" AFTER idRap');
      console.log('✅ Colonne libelle ajoutée');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠️  Colonne libelle existe déjà');
      } else {
        throw err;
      }
    }
    
    // Ajouter la colonne points
    try {
      await pool.query('ALTER TABLE Rapport ADD COLUMN points INT DEFAULT 0 AFTER libelle');
      console.log('✅ Colonne points ajoutée');
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('⚠️  Colonne points existe déjà');
      } else {
        throw err;
      }
    }
    
    // Vérifier le schéma
    const [columns] = await pool.query('SHOW COLUMNS FROM Rapport');
    console.log('\n📋 Nouvelle structure de Rapport:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    console.log('\n✅ Schéma corrigé avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addColumns();
