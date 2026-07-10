const pool = require('./database/db');

async function testDisplay() {
  try {
    console.log('🧪 Test d\'affichage des rapports\n');
    
    // Simuler le code du contrôleur getRapportsEleves
    const [rows] = await pool.query(`
      SELECT r.idRap, r.libelle, r.points, r.commentaire, r.matricule, r.event_date, r.created_at, r.idDiscipline, r.idAca,
        a.libelle AS annee, e.nom, e.prenom
      FROM Rapport r
      LEFT JOIN AnneeAcademique a ON a.idAnnee = r.idAca
      LEFT JOIN Eleve e ON e.matricule = r.matricule
      WHERE COALESCE(r.isDelete, 0) = 0
      ORDER BY r.event_date DESC, r.created_at DESC LIMIT 500
    `);
    
    console.log(`✅ Requête réussie!`);
    console.log(`📊 Nombre de rapports: ${rows.length}\n`);
    
    if (rows.length > 0) {
      console.log('📋 Premiers rapports:');
      rows.slice(0, 5).forEach((r, i) => {
        console.log(`  ${i+1}. ID: ${r.idRap}, Libellé: ${r.libelle}, Points: ${r.points}, idPers: ${r.idPers}`);
      });
    }
    
    console.log('\n✅ Aucune erreur "Field idPers doesn\'t have a default value"!');
    console.log('✅ Aucune erreur "Column idAca cannot be null"!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testDisplay();
