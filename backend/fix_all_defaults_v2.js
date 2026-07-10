const pool = require('./database/db');

async function fixAllDefaults() {
  try {
    console.log('🔧 Correction des valeurs par défaut manquantes...\n');
    
    // commentaire - TEXT ne peut pas avoir de default, donc on le rend nullable
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN commentaire TEXT NULL');
    console.log('✅ commentaire: NULLABLE (pas de default possible pour TEXT)');
    
    // event_date
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN event_date DATE DEFAULT CURDATE()');
    console.log('✅ event_date: DEFAULT CURDATE()');
    
    // idAca
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN idAca INT UNSIGNED DEFAULT 1');
    console.log('✅ idAca: DEFAULT 1');
    
    // idPers - déjà fait
    console.log('✅ idPers: DEFAULT 0 (déjà corrigé)');
    
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
