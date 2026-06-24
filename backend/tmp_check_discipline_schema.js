const pool = require('./database/db');

async function checkSchema() {
  try {
    console.log('Checking Discipline table schema...\n');
    const [disciplineColumns] = await pool.query('SHOW COLUMNS FROM Discipline');
    console.log('Discipline Columns:');
    disciplineColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkSchema();
