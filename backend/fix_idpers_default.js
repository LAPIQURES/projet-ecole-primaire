const pool = require('./database/db');

async function fix() {
  try {
    console.log('Ajout d\'une valeur par défaut à idPers...\n');
    
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN idPers INT UNSIGNED DEFAULT 0');
    
    console.log('✅ Colonne idPers modifiée');
    console.log('   DEFAULT: 0 (Aucun enseignant/admin)');
    
    // Vérifier
    const [cols] = await pool.query('SHOW COLUMNS FROM Rapport WHERE Field = "idPers"');
    console.log('\n📋 Nouvelle définition:');
    const col = cols[0];
    console.log(`  ${col.Field}: ${col.Type}, NULL=${col.Null}, DEFAULT=${col.Default}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

fix();
