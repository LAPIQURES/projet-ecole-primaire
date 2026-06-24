const pool = require('./database/db');

async function listTables() {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    console.log('Available tables:');
    tables.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`  - ${tableName}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

listTables();
