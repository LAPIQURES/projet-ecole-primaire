const mysql = require('mysql2/promise');
const config = require('./config');
(async () => {
  const pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: true,
    connectionLimit: 5,
  });
  try {
    const [salles] = await pool.query('SELECT idSalle, libelle, position, surface, capacite, actif, idClasse FROM Salle ORDER BY idSalle LIMIT 100');
    const [classes] = await pool.query('SELECT idClasse, libelle, idSalle FROM Classe ORDER BY idClasse LIMIT 100');
    const [enseignants] = await pool.query('SELECT id, nom, prenom, idClasse, idSalle FROM Enseignant ORDER BY id LIMIT 100');
    console.log('Salle rows:', salles.length);
    console.table(salles);
    console.log('Classe rows:', classes.length);
    console.table(classes);
    console.log('Enseignant rows:', enseignants.length);
    console.table(enseignants);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
