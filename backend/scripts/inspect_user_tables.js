const pool = require('../database/db');

async function inspect() {
  try {
    console.log('SHOW COLUMNS FROM Admin');
    const [colsAdmin] = await pool.query('SHOW COLUMNS FROM Admin');
    console.table(colsAdmin);

    console.log('\nSHOW COLUMNS FROM Personne');
    const [colsPers] = await pool.query('SHOW COLUMNS FROM Personne');
    console.table(colsPers);

    console.log('\nSample rows from Admin (LIMIT 5):');
    const [admins] = await pool.query('SELECT * FROM Admin LIMIT 5');
    console.dir(admins, { depth: 4 });

    console.log('\nSample rows from Personne (LIMIT 5):');
    const [pers] = await pool.query('SELECT * FROM Personne LIMIT 5');
    console.dir(pers, { depth: 4 });

    process.exit(0);
  } catch (err) {
    console.error('inspect error', err && err.message ? err.message : err);
    process.exit(2);
  }
}

inspect();
