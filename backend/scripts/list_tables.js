const pool = require('../database/db');

async function listAllTables() {
  try {
    const conn = await pool.getConnection();
    
    // Get all tables
    const [tables] = await conn.query('SHOW TABLES');
    console.log('\n📋 TOUTES LES TABLES:');
    tables.forEach(t => console.log(`  - ${Object.values(t)[0]}`));
    
    // Check important tables
    const tableNames = ['Evaluation', 'Bulletin', 'Classe', 'Salle', 'Cours', 'Enseignant', 'Sequence', 'Resultat'];
    
    for (const table of tableNames) {
      try {
        const [fields] = await conn.query(`DESC ${table}`);
        console.log(`\n📋 TABLE ${table}:`);
        fields.forEach(f => console.log(`  - ${f.Field}: ${f.Type}`));
      } catch (e) {
        console.log(`\n❌ Table ${table} n'existe pas`);
      }
    }
    
    conn.release();
    pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

listAllTables();
