const pool = require('./database/db');

async function testCreateRapport() {
  try {
    console.log('🧪 Test de création de rapport pour ÉLÈVE\n');
    
    // D'abord, vérifier les données
    const [annees] = await pool.query('SELECT idAnnee FROM AnneeAcademique ORDER BY created_at DESC LIMIT 1');
    console.log('Résultat SELECT annees:', annees);
    console.log('annees[0]:', annees[0]);
    
    let idAca = annees[0]?.idAnnee || 1;
    console.log('idAca final:', idAca);
    console.log('Type de idAca:', typeof idAca);
    
    // Vérifier s'il y a des élèves
    const [eleves] = await pool.query('SELECT matricule FROM Eleve LIMIT 1');
    if (eleves.length === 0) {
      console.log('❌ Pas d\'élèves dans la base');
      process.exit(1);
    }
    
    const matricule = eleves[0].matricule;
    console.log(`\n✅ Élève trouvé: ${matricule}`);
    
    // Test de création
    console.log('\n📝 Tentative de création d\'un rapport...\n');
    const [result] = await pool.query(
      `INSERT INTO Rapport (libelle, points, matricule, idAca, commentaire, event_date, idPers, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      ['Test rapport', 10, matricule, idAca, 'Commentaire test', new Date().toISOString().split('T')[0], 1000]
    );
    
    console.log('✅ Rapport créé avec succès!');
    console.log(`   ID: ${result.insertId}`);
    
    // Vérifier le rapport
    const [rapport] = await pool.query('SELECT * FROM Rapport WHERE idRap = ?', [result.insertId]);
    console.log('\n📄 Rapport inséré:');
    console.log(rapport[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  }
}

testCreateRapport();
