const pool = require('../database/db');

const columns = [
  { name: 'nom', type: 'VARCHAR(60) NULL' },
  { name: 'prenom', type: 'VARCHAR(60) NULL' },
  { name: 'mobile', type: 'VARCHAR(20) NULL' },
  { name: 'phone', type: 'VARCHAR(20) NULL' },
  { name: 'username', type: 'VARCHAR(100) NULL' },
  { name: 'dateNaissance', type: 'DATE NULL' },
  { name: 'lieuNaissance', type: 'VARCHAR(60) NULL' },
];

(async () => {
  try {
    const [existing] = await pool.query("SHOW COLUMNS FROM Personne");
    const existingNames = new Set(existing.map((col) => col.Field));

    for (const col of columns) {
      if (!existingNames.has(col.name)) {
        console.log(`Adding column Personne.${col.name}`);
        await pool.query(`ALTER TABLE Personne ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`Column Personne.${col.name} already exists`);
      }
    }
    console.log('Personne table migration completed.');
  } catch (err) {
    console.error('Migration error:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
