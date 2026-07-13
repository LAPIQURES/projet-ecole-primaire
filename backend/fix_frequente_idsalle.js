const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'ecole2026'
    });

    console.log('Fixing Frequente table structure...\n');

    // Step 1: Drop the foreign key constraint on idSalle
    try {
      await conn.execute('ALTER TABLE frequente DROP FOREIGN KEY liers');
      console.log('✓ Dropped old FK constraint "liers"');
    } catch (e) {
      console.log('  (FK constraint may not exist)');
    }

    // Step 2: Drop the index on idSalle
    try {
      await conn.execute('ALTER TABLE frequente DROP INDEX liers');
      console.log('✓ Dropped old index "liers"');
    } catch (e) {
      console.log('  (Index may not exist)');
    }

    // Step 3: Drop idSalle column from Frequente
    try {
      await conn.execute('ALTER TABLE frequente DROP COLUMN idSalle');
      console.log('✓ Dropped idSalle column from Frequente');
    } catch (e) {
      if (e.message.includes('check that column/key exists')) {
        console.log('✓ idSalle column already removed');
      } else {
        throw e;
      }
    }

    // Verify the new structure
    const [rows] = await conn.execute('DESCRIBE frequente');
    console.log('\nNew Frequente schema:');
    rows.forEach(r => {
      const nullable = r.Null === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = r.Default || 'NO DEFAULT';
      console.log(`  ${r.Field}: ${r.Type} ${nullable} DEFAULT:${defaultVal}`);
    });

    console.log('\n✅ Schema migration complete!');
    await conn.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
