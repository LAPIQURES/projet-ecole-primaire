const mysql = require('mysql2/promise');
const config = require('./config');

(async () => {
  let pool;
  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

    console.log('🔍 Checking Admin table:\n');

    const [admins] = await pool.query('SELECT ID, nom, username, actif FROM Admin LIMIT 10');
    
    if (admins.length === 0) {
      console.log('❌ No admins found! List is empty.');
    } else {
      console.log('📋 Existing admins:');
      admins.forEach(a => console.log(`  - ${a.username} (${a.nom}) - ID: ${a.ID} - actif: ${a.actif}`));
    }

    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (pool) await pool.end();
  }
})();
