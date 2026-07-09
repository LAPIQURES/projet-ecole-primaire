const pool = require('../database/db');
const config = require('../config');

async function run() {
  try {
    const dbName = config.db.database;
    console.log('Database:', dbName);

    const [tables] = await pool.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND (TABLE_NAME LIKE '%enseignant%' OR TABLE_NAME LIKE '%enseignants%')", [dbName]);
    if (!tables || tables.length === 0) {
      console.log('Aucune table contenant "enseignant" trouvée dans la base.');
      process.exit(0);
    }

    for (const t of tables) {
      const tableName = t.TABLE_NAME;
      const [res] = await pool.query(`SELECT COUNT(*) AS cnt FROM \`${tableName}\``);
      console.log(`Table ${tableName}: ${res[0].cnt} lignes`);
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT 5`);
      console.log('Exemples (max 5):');
      console.dir(rows, { depth: 3 });
      console.log('---');
    }

    process.exit(0);
  } catch (err) {
    console.error('Erreur:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

run();
