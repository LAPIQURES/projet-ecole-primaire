const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '163.123.183.89',
  port: 17705,
  user: 'ecole',
  password: 'peda2026',
  database: 'ecole2026'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Erreur :', err.message);
  } else {
    console.log('✅ Connecté à ecole2026 !');
  }
});

module.exports = connection;