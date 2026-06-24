const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('./config');
(async () => {
  try {
    const conn = await mysql.createConnection({ host: config.db.host, port: config.db.port, user: config.db.user, password: config.db.password, database: config.db.database });
    const [rows] = await conn.query("SELECT login, password, actif FROM Admin WHERE login = 'jude' LIMIT 1");
    console.log(rows);
    if (rows.length === 0) { console.log('NO JUDE'); process.exit(0); }
    const hash = rows[0].password;
    const ok = await bcrypt.compare('1234', hash);
    console.log('bcrypt compare result:', ok);
    await conn.end();
  } catch (e) { console.error(e.message); process.exit(1); }
})();
