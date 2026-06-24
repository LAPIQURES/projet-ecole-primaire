const pool = require('../database/db');

async function migrateEmploiSchema() {
  const migrations = [
    {
      name: 'Add idSalle to EmploiDuTemps',
      sql: `ALTER TABLE EmploiDuTemps ADD COLUMN idSalle INT UNSIGNED AFTER idCours`,
    }
  ];

  try {
    console.log('Starting EmploiDuTemps schema migration...\n');

    for (const migration of migrations) {
      console.log(`Executing: ${migration.name}...`);
      try {
        await pool.query(migration.sql);
        console.log(`  ✅ ${migration.name} - completed\n`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ⚠️ ${migration.name} - column already exists\n`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ EmploiDuTemps schema migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrateEmploiSchema();
