const mysql = require('mysql2/promise');
const config = require('./config');
(async () => {
  try {
    const conn = await mysql.createConnection({ host: config.db.host, port: config.db.port, user: config.db.user, password: config.db.password, database: config.db.database });
    const [cols] = await conn.query("SHOW COLUMNS FROM Admin LIKE 'username'");
    if (cols.length === 0) {
      await conn.query("ALTER TABLE Admin ADD COLUMN username VARCHAR(100) NULL AFTER login");
      console.log('Column username added');
    } else {
      console.log('Column username already exists');
    }
    await conn.query("UPDATE Admin SET username = login WHERE username IS NULL OR username = ''");
    console.log('Updated username values');
    await conn.end();
  } catch (e) { console.error('ERROR', e.message); process.exit(1); }
})();
