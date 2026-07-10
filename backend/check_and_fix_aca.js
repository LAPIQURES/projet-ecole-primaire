const pool = require('./database/db');

async function checkAndFix() {
  try {
    console.log('1️⃣  Vérification de la table AnneeAcademique...\n');
    const [annees] = await pool.query('SELECT * FROM AnneeAcademique');
    console.log('Années académiques:');
    if (annees.length === 0) {
      console.log('  ❌ Aucune année académique! Création d\'une année par défaut...\n');
      const currentYear = new Date().getFullYear();
      await pool.query('INSERT INTO AnneeAcademique (annee) VALUES (?)', [`${currentYear}/${currentYear + 1}`]);
      console.log(`  ✅ Année académique créée: ${currentYear}/${currentYear + 1}\n`);
    } else {
      annees.forEach(a => console.log(`  - ID: ${a.idAnnee}, Année: ${a.annee}`));
    }
    
    console.log('\n2️⃣  Vérification du schéma Rapport...\n');
    const [rapportCols] = await pool.query('SHOW COLUMNS FROM Rapport');
    const idAcaCol = rapportCols.find(c => c.Field === 'idAca');
    console.log(`Colonne idAca - Null: ${idAcaCol.Null}, Default: ${idAcaCol.Default}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}
checkAndFix();
