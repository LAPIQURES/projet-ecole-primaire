const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecole2026'
    });

    // Vérifier si jude existe déjà
    const [rows] = await connection.execute('SELECT * FROM Admin WHERE username = ?', ['jude']);
    
    if (rows.length > 0) {
      console.log('✅ Utilisateur jude existe déjà dans la base Admin');
      console.log('Détails:', rows[0]);
      await connection.end();
    } else {
      console.log('❌ Utilisateur jude non trouvé, création en cours...');
      const hashedPassword = await bcrypt.hash('1234', 10);
      await connection.execute(
        'INSERT INTO Admin (username, password, email, role) VALUES (?, ?, ?, ?)',
        ['jude', hashedPassword, 'jude@ecole.com', 'admin']
      );
      console.log('✅ Utilisateur admin jude créé avec succès (password: 1234)');
      await connection.end();
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
})();
