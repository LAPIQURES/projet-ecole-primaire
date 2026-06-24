const pool = require('./database/db');

async function checkSchema() {
  try {
    console.log('Checking EmploiDuTemps table schema...\n');
    const [columns] = await pool.query('SHOW COLUMNS FROM EmploiDuTemps');
    console.log('Columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkSchema();
