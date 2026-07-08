const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '163.123.183.89',
      port: 17705,
      database: 'ecole2026',
      user: 'ecole',
      password: 'peda2026'
    });

    console.log('=== DESCRIBE Personne ===');
    const [columns] = await conn.execute('DESCRIBE Personne');
    columns.forEach(c => {
      console.log(c.Field + ' | Type: ' + c.Type + ' | Null: ' + c.Null + ' | Key: ' + c.Key + ' | Default: ' + c.Default + ' | Extra: ' + c.Extra);
    });

    console.log('\n=== SELECT * FROM Personne WHERE username = "lapiqure" ===');
    const [rows] = await conn.execute('SELECT * FROM Personne WHERE username = ? LIMIT 1', ['lapiqure']);
    if (rows.length > 0) {
      const user = rows[0];
      console.log('User found:');
      Object.keys(user).forEach(key => {
        console.log('  ' + key + ': ' + user[key]);
      });
    } else {
      console.log('No user found with username "lapiqure"');
    }

    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
