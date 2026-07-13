const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'ecole2026'
    });

    const [rows] = await conn.execute('DESCRIBE Frequente');
    console.log('Frequente schema:');
    rows.forEach(r => {
      const defaultVal = r.Default || 'NO DEFAULT';
      const nullable = r.Null === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ${r.Field}: ${r.Type} ${nullable} DEFAULT:${defaultVal}`);
    });

    // Also check the full table creation info
    const [createInfo] = await conn.execute('SHOW CREATE TABLE Frequente');
    console.log('\nFull CREATE TABLE:');
    console.log(createInfo[0]['Create Table']);

    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
