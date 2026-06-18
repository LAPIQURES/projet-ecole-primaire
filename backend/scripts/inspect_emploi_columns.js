const pool = require('../database/db');
const config = require('../config');
(async () => {
  try {
    const [cols] = await pool.query("SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'EmploiDuTemps'", [config.db.database]);
    console.log(JSON.stringify(cols, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('err', e.message);
    process.exit(1);
  }
})();
