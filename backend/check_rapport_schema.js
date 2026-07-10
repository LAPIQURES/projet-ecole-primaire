const pool = require('./database/db');

async function check() {
  try {
    console.log('📋 Vérification du schéma Rapport...\n');
    
    const [cols] = await pool.query('SHOW COLUMNS FROM Rapport');
    console.log('Colonnes de Rapport:');
    cols.forEach(c => {
      const null_val = c.Null === 'YES' ? 'NULL' : 'NOT NULL';
      const default_val = c.Default !== null ? `DEFAULT '${c.Default}'` : 'NO DEFAULT';
      console.log(`  - ${c.Field} (${c.Type}) ${null_val} ${default_val}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

check();
