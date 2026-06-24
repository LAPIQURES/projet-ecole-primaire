const mysql = require('mysql2/promise');
const config = require('./config');
(async () => {
  try {
    const conn = await mysql.createConnection({ host: config.db.host, port: config.db.port, user: config.db.user, password: config.db.password, database: config.db.database });
    // Add column if not exists
    await conn.query("ALTER TABLE Admin ADD COLUMN IF NOT EXISTS username VARCHAR(100) NULL AFTER login");
    await conn.query("UPDATE Admin SET username = login WHERE username IS NULL OR username = ''");
    console.log('OK');
    await conn.end();
  } catch (e) { console.error('ERROR', e.message); process.exit(1); }
})();
