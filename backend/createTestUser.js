const bcrypt = require('bcrypt');
const pool = require('./database/db');

(async () => {
  try {
    const pwd = await bcrypt.hash('1234', 10);
    
    // Supprimer l'utilisateur s'il existe
    await pool.query('DELETE FROM Admin WHERE login = ?', ['jude']);
    
    // Créer le nouvel utilisateur
    const [result] = await pool.query(
      'INSERT INTO Admin (login, password, typeAdmin, actif, createdAt, updatedAt) VALUES (?, ?, ?, 1, NOW(), NOW())',
      ['jude', pwd, 2]
    );
    
    console.log('✅ Utilisateur jude créé');
    console.log('Login: jude');
    console.log('Password: 1234');
    process.exit(0);
  } catch (e) {
    console.log('❌ Erreur:', e.message);
    process.exit(1);
  }
})();


