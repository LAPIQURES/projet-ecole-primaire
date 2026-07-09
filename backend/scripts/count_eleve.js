const pool = require('../database/db');
const config = require('../config');

async function run() {
  try {
    const dbName = config.db.database;
    console.log('Database:', dbName);

    // Find tables that look like eleve/eleves
    const [tables] = await pool.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND (TABLE_NAME LIKE '%eleve%' OR TABLE_NAME LIKE '%eleves%')", [dbName]);
    if (!tables || tables.length === 0) {
      console.log('Aucune table contenant "eleve" trouvée dans la base.');
      process.exit(0);
    }

    for (const t of tables) {
      const tableName = t.TABLE_NAME;
      const [res] = await pool.query(`SELECT COUNT(*) AS cnt FROM \`${tableName}\``);
      console.log(`Table ${tableName}: ${res[0].cnt} lignes`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Erreur:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

run();
