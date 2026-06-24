const pool = require('./database/db');

async function checkSchema() {
  try {
    console.log('Checking Rapport table schema...\n');
    const [rapportColumns] = await pool.query('SHOW COLUMNS FROM Rapport');
    console.log('Rapport Columns:');
    rapportColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\nChecking if Rapports table exists...\n');
    const [tables] = await pool.query("SHOW TABLES LIKE 'Rapports'");
    if (tables.length === 0) {
      console.log('  ❌ Rapports table does NOT exist');
    } else {
      console.log('  ✅ Rapports table exists');
      const [rapportsColumns] = await pool.query('SHOW COLUMNS FROM Rapports');
      console.log('\nRapports Columns:');
      rapportsColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    }

    console.log('\nChecking DisciplineLog table...\n');
    const [disciplineTables] = await pool.query("SHOW TABLES LIKE 'DisciplineLog'");
    if (disciplineTables.length === 0) {
      console.log('  ❌ DisciplineLog table does NOT exist');
    } else {
      console.log('  ✅ DisciplineLog table exists');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkSchema();
