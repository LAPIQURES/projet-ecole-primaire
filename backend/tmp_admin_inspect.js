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
    const [cols] = await conn.query('SHOW COLUMNS FROM Admin');
    console.log('COLUMNS:\n', JSON.stringify(cols, null, 2));
    const [data] = await conn.query('SELECT * FROM Admin LIMIT 10');
    console.log('DATA:\n', JSON.stringify(data, null, 2));
    await conn.end();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
