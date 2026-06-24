const pool = require('../database/db');

(async function() {
  try {
    const [admins] = await pool.query('SELECT * FROM Admin WHERE login = ? OR username = ? LIMIT 1', ['jude', 'jude']);
    console.log('ADMIN:', admins.length ? admins[0] : 'none');
    const [persons] = await pool.query('SELECT * FROM Personne WHERE username = ? OR login = ? LIMIT 1', ['jude', 'jude']);
    console.log('PERSONNE:', persons.length ? persons[0] : 'none');
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
