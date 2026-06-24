const pool = require('./database/db');
(async () => {
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM Personne');
    console.log(cols.map(c => `${c.Field} ${c.Type}`).join('\n'));
  } catch (err) {
    console.error(err.message || err);
  } finally {
    await pool.end();
  }
})();
