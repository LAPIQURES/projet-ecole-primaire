const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '163.123.183.89',
      port: 17705,
      user: 'ecole',
      password: 'peda2026',
      database: 'ecole2026'
    });
    
    console.log('=== ParentEleve Table ===');
    const [parents] = await conn.query('DESCRIBE ParentEleve');
    parents.forEach(p => console.log(`  ${p.Field}: ${p.Type}`));
    
    console.log('\n=== Frequente Table ===');
    const [freq] = await conn.query('DESCRIBE Frequente');
    freq.forEach(f => console.log(`  ${f.Field}: ${f.Type}`));
    
    console.log('\n=== Sample ParentEleve Data ===');
    const [p] = await conn.query('SELECT * FROM ParentEleve LIMIT 2');
    console.log(JSON.stringify(p, null, 2));
    
    console.log('\n=== Sample Frequente Data ===');
    const [f] = await conn.query('SELECT * FROM Frequente LIMIT 2');
    console.log(JSON.stringify(f, null, 2));
    
    await conn.end();
  } catch(e) { console.error('ERROR:', e.message); }
})();
