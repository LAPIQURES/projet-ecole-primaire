const mysql = require('mysql2/promise');
const config = require('../config');

(async () => {
  let pool;
  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

    console.log('🔧 Migrating database schema for Classe-Salle relationship...\n');

    // Check if idSalle column exists in Classe
    const [classeCols] = await pool.query('SHOW COLUMNS FROM Classe WHERE Field = "idSalle"');
    
    if (classeCols.length === 0) {
      console.log('❌ Column idSalle missing from Classe table. Adding it...');
      await pool.query('ALTER TABLE Classe ADD COLUMN idSalle INT DEFAULT NULL AFTER idCycle');
      await pool.query('ALTER TABLE Classe ADD FOREIGN KEY (idSalle) REFERENCES Salle(idSalle) ON DELETE SET NULL');
      console.log('✅ Added idSalle column to Classe with foreign key constraint\n');
    } else {
      console.log('✅ Column idSalle already exists in Classe\n');
    }

    // Check if idClasse column exists in Frequente (expected to be there)
    const [frequenteCols] = await pool.query('SHOW COLUMNS FROM Frequente WHERE Field = "idClasse"');
    if (frequenteCols.length === 0) {
      console.log('❌ Column idClasse missing from Frequente table. Adding it...');
      await pool.query('ALTER TABLE Frequente ADD COLUMN idClasse INT DEFAULT NULL AFTER idFrequente');
      await pool.query('ALTER TABLE Frequente ADD FOREIGN KEY (idClasse) REFERENCES Classe(idClasse) ON DELETE SET NULL');
      console.log('✅ Added idClasse column to Frequente with foreign key constraint\n');
    } else {
      console.log('✅ Column idClasse already exists in Frequente\n');
    }

    // Remove old idSalle from Frequente if it exists (old relationship)
    const [frequenteSalleCol] = await pool.query('SHOW COLUMNS FROM Frequente WHERE Field = "idSalle"');
    if (frequenteSalleCol.length > 0) {
      console.log('⚠️  Found old idSalle column in Frequente. Removing it...');
      try {
        // First remove any foreign key constraint
        const [constraints] = await pool.query(`
          SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
          WHERE TABLE_NAME = 'Frequente' AND COLUMN_NAME = 'idSalle'
        `);
        for (const constraint of constraints) {
          try {
            await pool.query(`ALTER TABLE Frequente DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
          } catch (e) {
            // Ignore if constraint doesn't exist
          }
        }
        await pool.query('ALTER TABLE Frequente DROP COLUMN idSalle');
        console.log('✅ Removed old idSalle from Frequente\n');
      } catch (e) {
        console.log('⚠️  Could not remove idSalle from Frequente:', e.message, '\n');
      }
    }

    // Verify the final schema
    console.log('📋 Final schema verification:');
    const [finalClasseCols] = await pool.query('SHOW COLUMNS FROM Classe');
    console.log('\nClasse columns:');
    finalClasseCols.forEach(c => {
      if (['idClasse', 'libelle', 'idCycle', 'idSalle', 'idAdmin'].includes(c.Field)) {
        console.log(`  ✅ ${c.Field}: ${c.Type}`);
      }
    });

    const [finalFrequenteCols] = await pool.query('SHOW COLUMNS FROM Frequente');
    console.log('\nFrequente columns:');
    finalFrequenteCols.forEach(c => {
      if (['idFrequente', 'idClasse', 'idAcademi', 'matricule', 'idAdmin'].includes(c.Field)) {
        console.log(`  ✅ ${c.Field}: ${c.Type}`);
      }
    });

    // Test the join query that was failing
    console.log('\n🧪 Testing the join query from /api/eleves:');
    const [testRows] = await pool.query(`
      SELECT e.matricule, e.nom, c.idClasse, s.idSalle, s.libelle
      FROM Eleve e
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Classe c ON c.idClasse = f.idClasse
      LEFT JOIN Salle s ON s.idSalle = c.idSalle
      LIMIT 1
    `);
    console.log('✅ Join query executed successfully');
    console.log(`   Found ${testRows.length} rows in Eleve table\n`);

    console.log('✅ Database migration completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    if (pool) await pool.end();
    process.exit(1);
  }
})();
