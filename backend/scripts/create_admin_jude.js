const bcrypt = require('bcrypt');
const pool = require('../database/db');

async function createAdmin() {
  try {
    const username = 'jude';
    const password = '1234';
    const nom = 'jude';
    const typeAdmin = 2; // admin
    const actif = 1;

    const bcryptPwd = await bcrypt.hash(password, 10);
    const [existing] = await pool.query('SELECT * FROM Admin WHERE username = ?', [username]);

    if (existing.length > 0) {
      await pool.query(
        'UPDATE Admin SET password = ?, nom = ?, typeAdmin = ?, actif = ? WHERE username = ?',
        [bcryptPwd, nom, typeAdmin, actif, username]
      );
      console.log(`✅ Administrateur existant mis à jour : ${username}`);
    } else {
      await pool.query(
        'INSERT INTO Admin (username, password, nom, typeAdmin, actif, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [username, bcryptPwd, nom, typeAdmin, actif]
      );
      console.log(`✅ Administrateur créé : ${username}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l’administrateur :', error.message);
    process.exit(1);
  }
}

createAdmin();
