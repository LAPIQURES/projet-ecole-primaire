const pool = require('../database/db');
(async () => {
  try {
    const tables = ['Personne', 'Parents', 'EmploiDuTemps'];
    for (const table of tables) {
      const [cols] = await pool.query(`SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`, [table]);
      console.log(table + ':', cols.map((c) => c.COLUMN_NAME).join(', '));
      const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM ${table}`);
      console.log(table + ' count:', rows[0].c);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
