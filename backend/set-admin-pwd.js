const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '163.123.183.89',
      port: 17705,
      user: 'ecole',
      password: 'peda2026',
      database: 'ecole2026'
    });
    
    console.log('Setting admin password to "admin123"...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await conn.query(`
      UPDATE Personne 
      SET password = ?, username = 'admin'
      WHERE typePersonne = 1 
      LIMIT 1
    `, [hashedPassword]);
    
    console.log('✅ Admin password set to "admin123"');
    
    await conn.end();
  } catch (err) {
    console.error('ERROR:', err.message);
  }
})();
