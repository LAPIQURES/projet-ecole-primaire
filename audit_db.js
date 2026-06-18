const pool = require('./backend/database/db');

async function auditDatabase() {
  try {
    // Récupérer toutes les tables
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA='ecole2026' 
      ORDER BY TABLE_NAME
    `);

    console.log('\n📊 TABLES TROUVÉES DANS LA BASE DE DONNÉES:\n');
    console.log(`Total: ${tables.length} tables\n`);

    tables.forEach((row, index) => {
      console.log(`${index + 1}. ${row.TABLE_NAME}`);
    });

    // Récupérer colonnes pour chaque table
    console.log('\n\n📋 DÉTAIL DE CHAQUE TABLE:\n');

    for (const table of tables) {
      const [columns] = await pool.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA='ecole2026' AND TABLE_NAME='${table.TABLE_NAME}'
      `);

      console.log(`\n${'='.repeat(60)}`);
      console.log(`TABLE: ${table.TABLE_NAME}`);
      console.log(`${'='.repeat(60)}`);
      columns.forEach(col => {
        const pk = col.COLUMN_KEY === 'PRI' ? ' [PK]' : '';
        const nullable = col.IS_NULLABLE === 'YES' ? ' (nullable)' : '';
        console.log(`  • ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}${pk}${nullable}`);
      });
    }

    // Statistiques
    console.log('\n\n📈 STATISTIQUES:\n');
    const [stats] = await pool.query(`
      SELECT 
        TABLE_NAME, 
        TABLE_ROWS
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA='ecole2026'
      ORDER BY TABLE_ROWS DESC
    `);

    stats.forEach(row => {
      if (row.TABLE_ROWS > 0) {
        console.log(`${row.TABLE_NAME}: ${row.TABLE_ROWS} enregistrements`);
      }
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

auditDatabase();
