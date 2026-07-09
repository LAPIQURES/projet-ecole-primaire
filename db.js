const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from project .env if present
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecole2026'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Erreur :', err.message);
  } else {
    console.log('✅ Connecté à', connection.config.database, 'sur', connection.config.host + ':' + connection.config.port);
  }
});

module.exports = connection;