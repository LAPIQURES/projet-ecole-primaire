const pool = require('./database/db');

async function checkSchema() {
  try {
    console.log('Checking AnneeAcademique table schema...\n');
    const [anneeColumns] = await pool.query('SHOW COLUMNS FROM AnneeAcademique');
    console.log('AnneeAcademique Columns:');
    anneeColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\nChecking Trimestre table schema...\n');
    const [trimColumns] = await pool.query('SHOW COLUMNS FROM Trimestre');
    console.log('Trimestre Columns:');
    trimColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkSchema();
