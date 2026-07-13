const mysql = require('mysql2/promise');
const config = require('./config');

(async () => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

    console.log('✅ Connected to database\n');

    // Check Classe table structure
    const [classeCols] = await conn.query('SHOW COLUMNS FROM Classe');
    console.log('📋 Classe columns:');
    classeCols.forEach(c => console.log(`  - ${c.Field}: ${c.Type}`));

    console.log('\n📋 Salle columns:');
    const [salleCols] = await conn.query('SHOW COLUMNS FROM Salle');
    salleCols.forEach(c => console.log(`  - ${c.Field}: ${c.Type}`));

    console.log('\n📋 Frequente columns:');
    const [frequenteCols] = await conn.query('SHOW COLUMNS FROM Frequente');
    frequenteCols.forEach(c => console.log(`  - ${c.Field}: ${c.Type}`));

    // Check if idSalle exists in Classe
    const hasIdSalle = classeCols.some(c => c.Field === 'idSalle');
    console.log(`\n🔍 Classe.idSalle exists: ${hasIdSalle ? 'YES' : 'NO'}`);

    // Sample data
    const [classes] = await conn.query('SELECT idClasse, libelle, idSalle FROM Classe LIMIT 3');
    console.log('\n📊 Classe sample:');
    console.log(JSON.stringify(classes, null, 2));

    const [salles] = await conn.query('SELECT idSalle, libelle FROM Salle LIMIT 3');
    console.log('\n📊 Salle sample:');
    console.log(JSON.stringify(salles, null, 2));

    await conn.end();
    console.log('\n✅ Done');
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (conn) await conn.end();
    process.exit(1);
  }
})();
