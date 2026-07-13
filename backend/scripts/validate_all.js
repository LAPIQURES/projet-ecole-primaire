/**
 * Test final de validation : vérifie toutes les requêtes critiques
 */
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecole2026',
};

async function test() {
  const c = await mysql.createConnection(dbConfig);
  console.log('✅ Connecté à MySQL local\n');

  // 1. Comptes test
  const [comptes] = await c.query("SELECT ID, username, typeAdmin FROM Admin WHERE username IN ('judes','jud')");
  console.log('🔑 Comptes test créés:');
  comptes.forEach(r => console.log(`   → ${r.username} | typeAdmin=${r.typeAdmin}`));

  // 2. Stats directeur
  const [[eleves]] = await c.query('SELECT COUNT(*) as total FROM Eleve WHERE actif = 1');
  const [[ens]] = await c.query('SELECT COUNT(*) as total FROM Enseignant');
  const [[classes]] = await c.query('SELECT COUNT(*) as total FROM Classe');
  console.log('\n📊 Stats Directeur:');
  console.log(`   → Élèves: ${eleves.total} | Enseignants: ${ens.total} | Classes: ${classes.total}`);

  // 3. Stats Intendant - Encaissements
  const [[encaisse]] = await c.query("SELECT COALESCE(SUM(montant),0) as total FROM Paiement WHERE YEAR(datePaie)=YEAR(CURDATE())");
  console.log('\n💰 Stats Intendant:');
  console.log(`   → Encaissements cette année: ${Number(encaisse.total).toLocaleString('fr-FR')} HTG`);

  // 4. Élèves en dette (requête corrigée)
  const [dettes] = await c.query(`
    SELECT COUNT(*) as nb
    FROM Eleve e
    LEFT JOIN Frequente f ON f.matricule = e.matricule
    LEFT JOIN Classe cl ON cl.idClasse = f.idClasse
    LEFT JOIN Scolarite sc ON sc.idCycle = cl.idCycle
    LEFT JOIN (SELECT matricule, SUM(montant) as totalPaye FROM Paiement GROUP BY matricule) paye ON paye.matricule = e.matricule
    WHERE e.actif = 1
      AND ((COALESCE(sc.inscription,0) + COALESCE(sc.pension,0)) - COALESCE(paye.totalPaye, 0)) > 0
  `);
  console.log(`   → Élèves en dette: ${dettes[0].nb}`);

  // 5. Liste des dettes avec contact parent
  const [listeDetail] = await c.query(`
    SELECT e.matricule, e.nom, e.prenom,
      (COALESCE(sc.inscription,0) + COALESCE(sc.pension,0)) AS scolariteTotale,
      COALESCE(paye.totalPaye, 0) AS totalPaye,
      ((COALESCE(sc.inscription,0) + COALESCE(sc.pension,0)) - COALESCE(paye.totalPaye, 0)) AS reste,
      pr.nom AS parentNom, pr.mobile
    FROM Eleve e
    LEFT JOIN Frequente f ON f.matricule = e.matricule
    LEFT JOIN Classe cl ON cl.idClasse = f.idClasse
    LEFT JOIN Salle sal ON sal.idSalle = cl.idSalle
    LEFT JOIN Scolarite sc ON sc.idCycle = cl.idCycle
    LEFT JOIN (SELECT matricule, SUM(montant) as totalPaye FROM Paiement GROUP BY matricule) paye ON paye.matricule = e.matricule
    LEFT JOIN ParentEleve pe ON pe.matricule = e.matricule
    LEFT JOIN Personne pr ON pr.idPers = pe.idPers
    WHERE e.actif = 1
      AND ((COALESCE(sc.inscription,0) + COALESCE(sc.pension,0)) - COALESCE(paye.totalPaye, 0)) > 0
    GROUP BY e.matricule, e.nom, e.prenom, sc.inscription, sc.pension, paye.totalPaye, pr.nom, pr.mobile
    ORDER BY reste DESC
    LIMIT 3
  `);
  console.log(`   → Exemples (top 3 dettes):`);
  listeDetail.forEach(e => console.log(`     · ${e.prenom} ${e.nom}: reste=${Number(e.reste).toLocaleString('fr')} HTG, parent=${e.parentNom || '—'}, tel=${e.mobile || '—'}`));

  // 6. Modes de paiement
  const [modes] = await c.query("SELECT m.libelle AS modePaiement, SUM(p.montant) as total FROM Paiement p LEFT JOIN Mode m ON m.idMode = p.idMode WHERE YEAR(p.datePaie)=YEAR(CURDATE()) GROUP BY m.idMode, m.libelle");
  console.log(`   → Modes de paiement: ${modes.map(m => `${m.modePaiement || 'N/A'}=${Number(m.total).toLocaleString()}`).join(', ')}`);

  await c.end();
  console.log('\n🎉 VALIDATION COMPLÈTE — Tout fonctionne correctement !');
}

test().catch(err => {
  console.error('❌ ERREUR:', err.message);
  process.exit(1);
});
