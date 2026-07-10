const pool = require('./database/db');

async function testCreation() {
  try {
    console.log('🧪 Test de création de rapport après correction\n');
    
    // Vérifier qu'il y a un élève
    const [eleves] = await pool.query('SELECT matricule FROM Eleve LIMIT 1');
    if (eleves.length === 0) {
      console.log('❌ Pas d\'élèves dans la base');
      process.exit(1);
    }
    
    const matricule = eleves[0].matricule;
    console.log(`✅ Élève trouvé: ${matricule}`);
    
    // Test 1: Création simple
    console.log('\n📝 Test 1: Création avec tous les paramètres');
    const [result1] = await pool.query(
      `INSERT INTO Rapport (libelle, points, matricule, idAca, commentaire, event_date, idPers, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      ['Test rapport 1', 10, matricule, 1, 'Commentaire test', '2026-07-10', 0]
    );
    console.log(`✅ Rapport créé avec ID: ${result1.insertId}`);
    
    // Test 2: Création avec idPers NULL (doit utiliser default 0)
    console.log('\n📝 Test 2: Création avec idPers = NULL (utilise default 0)');
    const [result2] = await pool.query(
      `INSERT INTO Rapport (libelle, points, matricule, idAca, commentaire, event_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      ['Test rapport 2', 15, matricule, 1, 'Autre commentaire', '2026-07-10']
    );
    console.log(`✅ Rapport créé avec ID: ${result2.insertId}`);
    
    // Vérifier les rapports créés
    console.log('\n📋 Vérification des rapports:');
    const [check] = await pool.query('SELECT * FROM Rapport WHERE idRap IN (?, ?)', [result1.insertId, result2.insertId]);
    check.forEach(r => {
      console.log(`  - ID: ${r.idRap}, libelle: ${r.libelle}, idPers: ${r.idPers}`);
    });
    
    console.log('\n✅ Tous les tests réussis!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testCreation();
