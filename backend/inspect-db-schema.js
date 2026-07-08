const pool = require('./database/db');

(async () => {
  try {
    console.log('=== SCHEMA INSPECTION ===\n');
    
    // Evaluation table
    const [evalCols] = await pool.query('SHOW COLUMNS FROM Evaluation');
    console.log('Evaluation columns:');
    evalCols.forEach(c => {
      console.log(`  ${c.Field}: ${c.Type}, Null=${c.Null}, Default=${c.Default}`);
    });
    
    // Personne table
    const [personCols] = await pool.query('SHOW COLUMNS FROM Personne');
    console.log('\nPersonne columns:');
    personCols.forEach(c => {
      console.log(`  ${c.Field}: ${c.Type}, Null=${c.Null}, Default=${c.Default}`);
    });
    
    // Parents table
    const [parentCols] = await pool.query('SHOW COLUMNS FROM Parents');
    console.log('\nParents columns:');
    parentCols.forEach(c => {
      console.log(`  ${c.Field}: ${c.Type}, Null=${c.Null}, Default=${c.Default}`);
    });
    
    // ParentEleve table
    const [peCols] = await pool.query("SHOW TABLES LIKE 'ParentEleve'");
    console.log('\nParentEleve exists:', peCols.length > 0);
    if (peCols.length) {
      const [cols] = await pool.query('SHOW COLUMNS FROM ParentEleve');
      cols.forEach(c => {
        console.log(`  ${c.Field}: ${c.Type}, Null=${c.Null}, Default=${c.Default}`);
      });
    }
    
    console.log('\n✓ Schema inspection complete');
  } catch (e) {
    console.error('❌ ERROR:', e.message);
  } finally {
    await pool.end();
  }
})();
