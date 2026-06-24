const pool = require('../database/db');

async function checkMoreTables() {
  try {
    const conn = await pool.getConnection();
    
    const tableNames = ['Epreuve', 'Session', 'Trimestre', 'AnneeAcademique', 'ParentEleve', 'Frequente', 'Titulaire'];
    
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

checkMoreTables();
