const pool = require('../database/db');
const bcrypt = require('bcrypt');

const usersToCheck = [
  { login: 'jude', plain: '1234', role: 'Admin/Superadmin' },
  { login: 'lapiqure', plain: '1234', role: 'Enseignant' },
  { login: 'junior', plain: '1234', role: 'Parent' },
];

async function check() {
  try {
    for (const u of usersToCheck) {
      console.log('\n--- Checking', u.login, '---');

      // Check Admin table (Admin uses `username` column)
      const [admins] = await pool.query('SELECT * FROM Admin WHERE username = ? LIMIT 1', [u.login]);
      if (admins && admins.length) {
        const a = admins[0];
        const hash = a.password || a.pass || '';
        const isHash = typeof hash === 'string' && hash.startsWith('$2');
        const ok = isHash ? await bcrypt.compare(u.plain, hash) : u.plain === hash;
        console.log('Found in Admin table:', { id: a.ID || a.id, login: a.login || a.username, typeAdmin: a.typeAdmin });
        console.log('Password is hashed:', isHash, '=> match:', ok);
        continue;
      }

      // Check Personne table (has both `login` and `username`)
      const [people] = await pool.query('SELECT * FROM Personne WHERE login = ? OR username = ? LIMIT 1', [u.login, u.login]);
      if (people && people.length) {
        const p = people[0];
        const hash = p.password || p.pass || '';
        const isHash = typeof hash === 'string' && hash.startsWith('$2');
        const ok = isHash ? await bcrypt.compare(u.plain, hash) : u.plain === hash;
        console.log('Found in Personne table:', { id: p.idPers || p.ID || p.id, username: p.username || p.login, typePersonne: p.typePersonne });
        console.log('Password is hashed:', isHash, '=> match:', ok);
        continue;
      }

      console.log('User not found in Admin or Personne tables.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking users:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

check();
