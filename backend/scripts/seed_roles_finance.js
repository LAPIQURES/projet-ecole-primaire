const pool = require('../database/db');
const bcrypt = require('bcrypt');

async function upsertAdmin(login, plainPassword, typeAdmin) {
  const hash = await bcrypt.hash(plainPassword, 10);
  const [rows] = await pool.query('SELECT ID FROM Admin WHERE login = ? LIMIT 1', [login]);
  if (rows.length) {
    await pool.query('UPDATE Admin SET password = ?, typeAdmin = ? WHERE ID = ?', [hash, typeAdmin, rows[0].ID]);
    console.log(`Admin ${login} mis à jour`);
  } else {
    await pool.query('INSERT INTO Admin (login, password, typeAdmin, actif, createdAt) VALUES (?, ?, ?, 1, NOW())', [login, hash, typeAdmin]);
    console.log(`Admin ${login} créé`);
  }
}

async function seed() {
  try {
    console.log('Seeding director and intendant users...');
    await upsertAdmin('judes', '1234', 5);
    await upsertAdmin('jud', '1234', 6);
    console.log('Seed terminé.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

seed();
