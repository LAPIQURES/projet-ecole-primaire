const mysql = require('mysql2/promise');
const config = require('./config');
(async () => {
  try {
    const pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
    const [before] = await pool.query('SELECT COUNT(*) AS count FROM Salle');
    console.log('Salle count before:', before[0].count);
    await pool.query('UPDATE Classe SET idSalle = NULL');
    await pool.query('DELETE FROM Salle');
    const [after] = await pool.query('SELECT COUNT(*) AS count FROM Salle');
    console.log('Salle count after:', after[0].count);
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
