const bcrypt = require('bcrypt');
const pool = require('../database/db');

async function createAdmin() {
  try {
    const username = 'jude';
    const password = '1234';
    const typeAdmin = 2; // admin
    const actif = 1;

    const bcryptPwd = await bcrypt.hash(password, 10);
    const [existing] = await pool.query('SELECT * FROM Admin WHERE username = ?', [username]);

    if (existing.length > 0) {
      await pool.query(
        'UPDATE Admin SET nom = ?, password = ?, typeAdmin = ?, actif = ?, isDelete = 0, createdAt = NOW(), updatedAt = NOW(), langue = ?, created_at = NOW() WHERE username = ?',
        ['Jude', bcryptPwd, typeAdmin, actif, 'fr', username]
      );
      console.log(`✅ Administrateur existant mis à jour : ${username}`);
    } else {
      await pool.query(
        'INSERT INTO Admin (nom, username, password, actif, typeAdmin, mobile, isDelete, createdAt, updatedAt, langue, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW(), ?, NOW())',
        ['Jude', username, bcryptPwd, actif, typeAdmin, '', 'fr']
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
