const pool = require('../database/db');

async function listSchema() {
  try {
    const [tables] = await pool.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?", [require('../config').db.database]);
    const result = {};
    for (const t of tables) {
      const name = t.TABLE_NAME;
      const [cols] = await pool.query(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
        [require('../config').db.database, name]
      );
      result[name] = cols.map(c => ({ name: c.COLUMN_NAME, type: c.COLUMN_TYPE, nullable: c.IS_NULLABLE, default: c.COLUMN_DEFAULT }));
    }
    console.log(JSON.stringify({ database: require('../config').db.database, tables: Object.keys(result).length, schema: result }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err && err.stack ? err.stack : err);
    process.exit(2);
  }
}

listSchema();
