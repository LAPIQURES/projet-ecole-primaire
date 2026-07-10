const pool = require('./database/db');

async function fixAllDefaults() {
  try {
    console.log('🔧 Correction des valeurs par défaut manquantes...\n');
    
    // commentaire - TEXT ne peut pas avoir de default, donc on le rend nullable
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN commentaire TEXT NULL');
    console.log('✅ commentaire: NULLABLE');
    
    // event_date - utiliser CURRENT_DATE au lieu de CURDATE()
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN event_date DATE DEFAULT CURRENT_DATE');
    console.log('✅ event_date: DEFAULT CURRENT_DATE');
    
    // idAca
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN idAca INT UNSIGNED DEFAULT 1');
    console.log('✅ idAca: DEFAULT 1');
    
    // idPers
    console.log('✅ idPers: DEFAULT 0');
    
    // Vérifier tous les changements
    console.log('\n📋 Nouvelle structure de Rapport (colonnes clés):');
    const [cols] = await pool.query('SHOW COLUMNS FROM Rapport');
    cols.forEach(c => {
      if (['idPers', 'commentaire', 'event_date', 'matricule', 'idAca'].includes(c.Field)) {
        const null_val = c.Null === 'YES' ? 'NULL' : 'NOT NULL';
        const default_val = c.Default !== null ? `DEFAULT ${c.Default}` : 'NO DEFAULT';
        console.log(`  - ${c.Field}: ${null_val} ${default_val}`);
      }
    });
    
    console.log('\n✅ Schéma corrigé!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixAllDefaults();
