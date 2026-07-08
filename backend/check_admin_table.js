const mysql = require('mysql2/promise');
const config = require('./config');

(async () => {
  try {
    const pool = mysql.createPool(config.db);
    const [rows] = await pool.query('DESCRIBE Admin');
    console.log('=== Colonnes de la table Admin ===');
    rows.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    pool.end();
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
})();
