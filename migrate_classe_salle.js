/**
 * Migration script: Remove idClasse from Salle table
 * The relationship is now: Classe -> Salle (via Classe.idSalle)
 * Salle is independent and no longer references a Classe.
 */
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'ecole2026'
  });

  console.log('=== Migration: Classe/Salle relationship fix ===\n');

  try {
    // 1. Check current state
    console.log('1. Checking current Salle.idClasse data...');
    const [salleData] = await conn.query('SELECT idSalle, libelle, idClasse FROM Salle WHERE idClasse IS NOT NULL');
    console.log(`   Found ${salleData.length} salles with idClasse set.`);

    // 2. Ensure Classe.idSalle is populated from existing Salle.idClasse data
    console.log('2. Syncing Classe.idSalle from Salle.idClasse...');
    for (const salle of salleData) {
      if (salle.idClasse) {
        // Check if the classe already has an idSalle
        const [classeRows] = await conn.query('SELECT idClasse, libelle, idSalle FROM Classe WHERE idClasse = ?', [salle.idClasse]);
        if (classeRows.length > 0) {
          const classe = classeRows[0];
          if (!classe.idSalle) {
            await conn.query('UPDATE Classe SET idSalle = ? WHERE idClasse = ?', [salle.idSalle, salle.idClasse]);
            console.log(`   Classe "${classe.libelle}" (${classe.idClasse}) -> Salle "${salle.libelle}" (${salle.idSalle})`);
          } else {
            console.log(`   Classe "${classe.libelle}" already has idSalle=${classe.idSalle}, skipping.`);
          }
        }
      }
    }

    // 3. Drop the foreign key constraint on Salle.idClasse (if exists)
    console.log('3. Dropping foreign key on Salle.idClasse...');
    try {
      const [fks] = await conn.query(`
        SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'ecole2026' AND TABLE_NAME = 'Salle' AND COLUMN_NAME = 'idClasse'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      for (const fk of fks) {
        await conn.query(`ALTER TABLE Salle DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
        console.log(`   Dropped FK: ${fk.CONSTRAINT_NAME}`);
      }
    } catch (e) {
      console.log(`   No foreign key to drop (${e.message})`);
    }

    // 4. Drop the index on Salle.idClasse (if exists)
    console.log('4. Dropping index on Salle.idClasse...');
    try {
      const [indexes] = await conn.query(`SHOW INDEX FROM Salle WHERE Column_name = 'idClasse'`);
      for (const idx of indexes) {
        await conn.query(`ALTER TABLE Salle DROP INDEX ${idx.Key_name}`);
        console.log(`   Dropped index: ${idx.Key_name}`);
      }
    } catch (e) {
      console.log(`   No index to drop (${e.message})`);
    }

    // 5. Drop the idClasse column from Salle
    console.log('5. Dropping idClasse column from Salle...');
    try {
      await conn.query('ALTER TABLE Salle DROP COLUMN idClasse');
      console.log('   Done! idClasse removed from Salle.');
    } catch (e) {
      console.log(`   Column may already be removed (${e.message})`);
    }

    // 6. Verify
    console.log('\n6. Verification:');
    const [salleDesc] = await conn.query('DESCRIBE Salle');
    console.log('   Salle columns:', salleDesc.map(r => r.Field).join(', '));
    
    const [classeDesc] = await conn.query('DESCRIBE Classe');
    console.log('   Classe columns:', classeDesc.map(r => r.Field).join(', '));
    
    const [freqDesc] = await conn.query('DESCRIBE Frequente');
    console.log('   Frequente columns:', freqDesc.map(r => r.Field).join(', '));

    console.log('\n=== Migration completed successfully! ===');
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await conn.end();
  }
}

migrate();
