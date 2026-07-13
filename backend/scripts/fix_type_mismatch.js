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

    console.log('🔧 Fixing type mismatch for foreign key columns...\n');

    // Change Classe.idSalle to int unsigned to match Salle.idSalle
    console.log('📝 Fixing Classe.idSalle type to match Salle.idSalle...');
    try {
      // First remove any foreign key constraints
      const [constraints] = await pool.query(`
        SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'Classe' AND COLUMN_NAME = 'idSalle'
        AND CONSTRAINT_NAME != 'PRIMARY'
      `);
      
      for (const constraint of constraints) {
        try {
          await pool.query(`ALTER TABLE Classe DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
          console.log(`  ✅ Dropped constraint: ${constraint.CONSTRAINT_NAME}`);
        } catch (e) {
          // Ignore
        }
      }

      // Modify the column type
      await pool.query('ALTER TABLE Classe MODIFY COLUMN idSalle INT UNSIGNED DEFAULT NULL');
      console.log('  ✅ Column type changed to INT UNSIGNED');

      // Re-add foreign key constraint
      try {
        await pool.query(`ALTER TABLE Classe ADD CONSTRAINT fk_classe_salle FOREIGN KEY (idSalle) REFERENCES Salle(idSalle) ON DELETE SET NULL`);
        console.log('  ✅ Foreign key constraint re-added');
      } catch (e) {
        console.log(`  ⚠️  FK constraint might already exist: ${e.message}`);
      }
    } catch (e) {
      console.error('  ❌ Error:', e.message);
    }

    // Also ensure Frequente.idClasse type matches Classe.idClasse
    console.log('\n📝 Ensuring Frequente.idClasse type matches Classe.idClasse...');
    const [classeCols] = await pool.query('SHOW COLUMNS FROM Classe WHERE Field = "idClasse"');
    const classeIdType = classeCols[0]?.Type || 'int';
    console.log(`  Classe.idClasse type: ${classeIdType}`);

    const [frequenteCols] = await pool.query('SHOW COLUMNS FROM Frequente WHERE Field = "idClasse"');
    const frequenteIdType = frequenteCols[0]?.Type || 'int';
    console.log(`  Frequente.idClasse type: ${frequenteIdType}`);

    if (frequenteIdType !== classeIdType) {
      console.log('  ⚠️  Type mismatch, attempting to fix...');
      try {
        // Remove FK constraints first
        const [fkConstraints] = await pool.query(`
          SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
          WHERE TABLE_NAME = 'Frequente' AND COLUMN_NAME = 'idClasse'
          AND CONSTRAINT_NAME != 'PRIMARY'
        `);
        
        for (const constraint of fkConstraints) {
          try {
            await pool.query(`ALTER TABLE Frequente DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
          } catch (e) {
            // Ignore
          }
        }

        await pool.query(`ALTER TABLE Frequente MODIFY COLUMN idClasse ${classeIdType} DEFAULT NULL`);
        console.log(`  ✅ Changed Frequente.idClasse to ${classeIdType}`);
      } catch (e) {
        console.log(`  ❌ Could not fix type: ${e.message}`);
      }
    } else {
      console.log('  ✅ Types match');
    }

    // Final verification
    console.log('\n✅ Final schema state:');
    const [finalSalleCols] = await pool.query('SHOW COLUMNS FROM Salle WHERE Field = "idSalle"');
    console.log(`  Salle.idSalle: ${finalSalleCols[0]?.Type}`);

    const [finalClasseCols] = await pool.query('SHOW COLUMNS FROM Classe WHERE Field = "idSalle"');
    console.log(`  Classe.idSalle: ${finalClasseCols[0]?.Type}`);

    const [finalFrequenteCols] = await pool.query('SHOW COLUMNS FROM Frequente WHERE Field = "idClasse"');
    console.log(`  Frequente.idClasse: ${finalFrequenteCols[0]?.Type}`);

    // Test the join again
    console.log('\n🧪 Testing join query again:');
    try {
      const [testRows] = await pool.query(`
        SELECT e.matricule, e.nom, c.idClasse, s.idSalle, s.libelle AS salle, c.libelle AS classe
        FROM Eleve e
        LEFT JOIN Frequente f ON f.matricule = e.matricule
        LEFT JOIN Classe c ON c.idClasse = f.idClasse
        LEFT JOIN Salle s ON s.idSalle = c.idSalle
        LIMIT 3
      `);
      console.log('✅ Join query successful!');
      if (testRows.length > 0) {
        console.log('   Sample result:', JSON.stringify(testRows[0], null, 2));
      } else {
        console.log('   (No eleves yet)');
      }
    } catch (e) {
      console.error('❌ Join query failed:', e.message);
    }

    await pool.end();
    console.log('\n✅ Type fixes complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (pool) await pool.end();
    process.exit(1);
  }
})();
