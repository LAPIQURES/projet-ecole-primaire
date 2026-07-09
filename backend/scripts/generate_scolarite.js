const pool = require('../database/db');

async function run() {
  try {
    console.log('--- Checking existing classes for Scolarite ---');
    // Find classes that do NOT have a Scolarite
    const [classes] = await pool.query(`
      SELECT c.idClasse, c.idCycle, c.libelle
      FROM Classe c
      LEFT JOIN Scolarite s ON s.idClasse = c.idClasse
      WHERE s.idScolarite IS NULL
    `);

    if (classes.length === 0) {
      console.log('All classes already have a Scolarite record linked.');
      process.exit(0);
    }

    console.log(`Found ${classes.length} classes without Scolarite. Generating...`);

    const DEFAULT_PENSION = 150000;
    const t1 = Math.round(DEFAULT_PENSION / 3);
    const t2 = Math.round(DEFAULT_PENSION / 3);
    const t3 = DEFAULT_PENSION - (t1 + t2);

    for (const c of classes) {
      console.log(`Generating for class: ${c.libelle} (id: ${c.idClasse})`);
      
      const [scolResult] = await pool.query(
        `INSERT INTO Scolarite (inscription, pension, nbreTranche, description, idCycle, idClasse, idFondateur, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [0, DEFAULT_PENSION, 3, 'Auto-généré', c.idCycle, c.idClasse, 1]
      );
      
      const idScolarite = scolResult.insertId;
      
      await pool.query(
        `INSERT INTO Tranches (libelle, montant, delai_mois, delai_jour, idScolarite, actif, idFondateur) VALUES 
        ('Tranche 1', ?, '', '', ?, 1, 1),
        ('Tranche 2', ?, '', '', ?, 1, 1),
        ('Tranche 3', ?, '', '', ?, 1, 1)`,
        [t1, idScolarite, t2, idScolarite, t3, idScolarite]
      );
    }

    console.log('Generation completed successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
