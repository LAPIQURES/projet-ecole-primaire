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

    console.log('🔧 Schema analysis for Classe-Salle relationship...\n');

    // Check Salle.idSalle type
    const [salleCols] = await pool.query('SHOW COLUMNS FROM Salle WHERE Field = "idSalle"');
    const salleIdType = salleCols[0]?.Type || 'UNKNOWN';
    console.log(`Salle.idSalle type: ${salleIdType}`);

    // Check Classe.idSalle
    const [classeCols] = await pool.query('SHOW COLUMNS FROM Classe WHERE Field = "idSalle"');
    if (classeCols.length > 0) {
      console.log(`Classe.idSalle type: ${classeCols[0].Type}`);
      console.log('✅ Column already exists');
    } else {
      console.log('❌ Classe.idSalle column missing');
      
      // Add column with same type as Salle.idSalle
      console.log(`\n📝 Adding Classe.idSalle column with type: ${salleIdType}...`);
      await pool.query(`ALTER TABLE Classe ADD COLUMN idSalle ${salleIdType} DEFAULT NULL AFTER idCycle`);
      console.log('✅ Column added');

      // Try to add FK constraint separately
      console.log('📝 Adding foreign key constraint...');
      try {
        await pool.query(`ALTER TABLE Classe ADD CONSTRAINT fk_classe_salle FOREIGN KEY (idSalle) REFERENCES Salle(idSalle) ON DELETE SET NULL`);
        console.log('✅ Foreign key added');
      } catch (e) {
        console.log(`⚠️  Could not add FK constraint: ${e.message}`);
        // Continue anyway - the column is there which is what we need
      }
    }

    // Check Frequente.idClasse
    const [frequenteCols] = await pool.query('SHOW COLUMNS FROM Frequente WHERE Field = "idClasse"');
    if (frequenteCols.length === 0) {
      console.log(`\n❌ Frequente.idClasse column missing`);
      console.log('📝 Adding Frequente.idClasse column...');
      await pool.query('ALTER TABLE Frequente ADD COLUMN idClasse INT DEFAULT NULL AFTER idFrequente');
      console.log('✅ Column added');
    } else {
      console.log(`\n✅ Frequente.idClasse already exists (${frequenteCols[0].Type})`);
    }

    // Test the join query
    console.log('\n🧪 Testing join query:');
    try {
      const [testRows] = await pool.query(`
        SELECT e.matricule, e.nom, c.idClasse, s.idSalle, s.libelle
        FROM Eleve e
        LEFT JOIN Frequente f ON f.matricule = e.matricule
        LEFT JOIN Classe c ON c.idClasse = f.idClasse
        LEFT JOIN Salle s ON s.idSalle = c.idSalle
        LIMIT 1
      `);
      console.log('✅ Join query works!');
      console.log(`   Sample row count: ${testRows.length}`);
    } catch (e) {
      console.error('❌ Join query failed:', e.message);
    }

    await pool.end();
    console.log('\n✅ Migration analysis complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (pool) await pool.end();
    process.exit(1);
  }
})();
