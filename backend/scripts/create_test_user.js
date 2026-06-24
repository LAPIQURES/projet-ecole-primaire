const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('../config');

async function createTestUser() {
  const pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  });

  try {
    console.log('🔌 Connexion à la base de données...');
    
    // Vérifier la connexion
    const conn = await pool.getConnection();
    console.log('✅ Connecté à MySQL');
    
    // Vérifier si "jude" existe dans Admin
    const [admins] = await conn.query(
      'SELECT * FROM Admin WHERE login = ? OR username = ?',
      ['jude', 'jude']
    );

    if (admins.length > 0) {
      console.log('📌 Utilisateur "jude" existe déjà dans Admin');
      console.log('   - ID:', admins[0].ID);
      console.log('   - Login:', admins[0].login);
      console.log('   - Type:', admins[0].typeAdmin);
      console.log('\n✏️  Mise à jour du mot de passe...');
      
      const hashedPassword = await bcrypt.hash('1234', 10);
      await conn.query(
        'UPDATE Admin SET password = ? WHERE ID = ?',
        [hashedPassword, admins[0].ID]
      );
      console.log('✅ Mot de passe "1234" défini');
    } else {
      console.log('👤 Création de l\'utilisateur "jude"...');
      
      const hashedPassword = await bcrypt.hash('1234', 10);
      await conn.query(
        `INSERT INTO Admin (login, username, password, nom, typeAdmin, actif, created_at) 
         VALUES (?, ?, ?, ?, ?, 1, NOW())`,
        ['jude', 'jude', hashedPassword, 'Jude Admin', 2]
      );
      console.log('✅ Utilisateur "jude" créé avec le mot de passe "1234"');
    }

    conn.release();
    pool.end();
    console.log('\n✅ Opération terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('   Config:', {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
    });
    process.exit(1);
  }
}

createTestUser();
