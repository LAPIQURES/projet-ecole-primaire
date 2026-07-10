const pool = require('./database/db');

async function testFix() {
  try {
    console.log('🧪 Test du contrôleur getRapportsEleves\n');
    
    // Simuler le code du contrôleur
    const [rows] = await pool.query(`
      SELECT r.idRap, r.libelle, r.points, r.commentaire, r.matricule, r.event_date, r.created_at, r.idDiscipline, r.idAca,
        a.libelle AS annee, e.nom, e.prenom
      FROM Rapport r
      LEFT JOIN AnneeAcademique a ON a.idAnnee = r.idAca
      LEFT JOIN Eleve e ON e.matricule = r.matricule
      WHERE COALESCE(r.isDelete, 0) = 0
      ORDER BY r.event_date DESC, r.created_at DESC LIMIT 500
    `);
    
    console.log(`✅ Requête SQL réussie!`);
    console.log(`📊 Nombre de rapports: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('\n📄 Exemple de rapport:');
      console.log(rows[0]);
    }
    
    // Vérifier que toutes les colonnes requises sont présentes
    if (rows.length > 0) {
      const requiredFields = ['idRap', 'libelle', 'points', 'matricule', 'idAca', 'event_date'];
      const sample = rows[0];
      console.log('\n✅ Colonnes vérifiées:');
      requiredFields.forEach(field => {
        const exists = field in sample;
        console.log(`  ${exists ? '✓' : '✗'} ${field}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testFix();
