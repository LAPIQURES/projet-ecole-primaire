const mysql = require('mysql2/promise');
const config = require('./config');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const pool = mysql.createPool(config.db);
    
    // Récupérer l'utilisateur jude
    const [users] = await pool.query('SELECT * FROM Admin WHERE username = ?', ['jude']);
    
    if (users.length === 0) {
      console.log('❌ Utilisateur "jude" NOT FOUND');
      pool.end();
      process.exit(1);
    }
    
    const user = users[0];
    console.log('✅ Utilisateur trouvé:');
    console.log('   ID:', user.ID);
    console.log('   Username:', user.username);
    console.log('   Password (stocké):', user.password);
    console.log('   typeAdmin:', user.typeAdmin);
    console.log('   actif:', user.actif);
    console.log('   isDelete:', user.isDelete);
    
    // Vérifier si le mot de passe est hashé
    const isHashed = user.password.startsWith('$2');
    console.log('\n📌 Mot de passe hashé?', isHashed);
    
    if (isHashed) {
      // Tester le mot de passe "1234"
      const match = await bcrypt.compare('1234', user.password);
      console.log('   Compare bcrypt("1234", hash):', match);
    } else {
      // Comparaison directe
      console.log('   Compare direct ("1234" === "' + user.password + '"):', '1234' === user.password);
    }
    
    pool.end();
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
})();
