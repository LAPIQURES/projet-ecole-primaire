const bcrypt = require('bcrypt');
const pool = require('../database/db');

async function createAdmin() {
  try {
    const login = 'jude';
    const password = '1234';
    const typeAdmin = 2; // admin
    const actif = 1;

    const bcryptPwd = await bcrypt.hash(password, 10);
    const [existing] = await pool.query('SELECT * FROM Admin WHERE login = ?', [login]);

    if (existing.length > 0) {
      await pool.query(
        'UPDATE Admin SET password = ?, typeAdmin = ?, actif = ?, isDelete = 0, updatedAt = NOW() WHERE login = ?',
        [bcryptPwd, typeAdmin, actif, login]
      );
      console.log(`✅ Administrateur existant mis à jour : ${login}`);
    } else {
      await pool.query(
        'INSERT INTO Admin (login, password, typeAdmin, actif, isDelete, createdAt, updatedAt, langue) VALUES (?, ?, ?, ?, 0, NOW(), NOW(), ?)',
        [login, bcryptPwd, typeAdmin, actif, 'fr']
      );
      console.log(`✅ Administrateur créé : ${login}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l’administrateur :', error.message);
    process.exit(1);
  }
}

createAdmin();
