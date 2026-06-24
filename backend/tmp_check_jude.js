const mysql = require('mysql2/promise');
const config = require('./config');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
    });
    const [rows] = await conn.query("SELECT login, password, typeAdmin, actif FROM Admin WHERE login = 'jude' OR login = 'admin_root' OR login = 'admin_insc' LIMIT 10");
    console.log(JSON.stringify(rows, null, 2));
    await conn.end();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
