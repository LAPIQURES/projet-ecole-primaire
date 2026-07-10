const pool = require('./database/db');

async function fixRapports() {
  try {
    console.log('🔍 Vérification des rapports existants...\n');
    
    // Vérifier les rapports avec idAca NULL
    const [nulls] = await pool.query('SELECT COUNT(*) as count FROM Rapport WHERE idAca IS NULL');
    console.log(`Rapports avec idAca NULL: ${nulls[0].count}`);
    
    if (nulls[0].count > 0) {
      console.log('\n✏️  Remplissage des idAca manquants...');
      
      // Récupérer la première année académique valide
      const [annees] = await pool.query('SELECT idAnnee FROM AnneeAcademique WHERE idAnnee IS NOT NULL LIMIT 1');
      let idAcaDefault = annees[0]?.idAnnee || 1;
      
      console.log(`Utilisation de idAca = ${idAcaDefault} par défaut`);
      
      // Mettre à jour les rapports avec idAca NULL
      const [update] = await pool.query('UPDATE Rapport SET idAca = ? WHERE idAca IS NULL', [idAcaDefault]);
      console.log(`✅ ${update.changedRows} rapports mis à jour`);
    }
    
    // Vérifier les colonnes manquantes dans la sélection
    console.log('\n📋 Structure actuelle de Rapport:');
    const [cols] = await pool.query('SHOW COLUMNS FROM Rapport');
    const colNames = cols.map(c => c.Field);
    console.log(colNames.join(', '));
    
    // Afficher un exemple de rapport
    console.log('\n📄 Exemple de rapport:');
    const [sample] = await pool.query('SELECT * FROM Rapport LIMIT 1');
    if (sample.length > 0) {
      console.log(sample[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixRapports();
