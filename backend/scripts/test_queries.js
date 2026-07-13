const mysql = require('mysql2/promise');
async function test() {
  const c = await mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'',database:'ecole2026'});
  
  const [rows] = await c.query("SELECT ID, username, typeAdmin FROM Admin WHERE username IN ('judes','jud')");
  console.log('✅ Comptes test:', JSON.stringify(rows, null, 2));

  const [encaisse] = await c.query("SELECT COALESCE(SUM(montant),0) as total FROM Paiement WHERE YEAR(datePaie)=YEAR(CURDATE())");
  console.log('💰 Encaissements cette année:', encaisse[0].total);

  const [dettes] = await c.query(`
    SELECT COUNT(*) as nb
    FROM Eleve e
    LEFT JOIN Frequente f ON f.matricule = e.matricule
    LEFT JOIN Classe cl ON cl.idClasse = f.idClasse
    LEFT JOIN Salle sal ON sal.idSalle = cl.idSalle
    LEFT JOIN Scolarite sc ON sc.idCycle = cl.idCycle
    LEFT JOIN (SELECT matricule, SUM(montant) as totalPaye FROM Paiement GROUP BY matricule) paye ON paye.matricule = e.matricule
    WHERE e.actif = 1
      AND (COALESCE(sc.montantTotal, 0) - COALESCE(paye.totalPaye, 0)) > 0
  `);
  console.log('⚠️  Élèves en dette:', dettes[0].nb);

  const [stats] = await c.query("SELECT COUNT(*) as total FROM Eleve WHERE actif = 1");
  console.log('👥 Élèves actifs:', stats[0].total);

  const [ens] = await c.query("SELECT COUNT(*) as total FROM Enseignant");
  console.log('👩‍🏫 Enseignants:', ens[0].total);

  await c.end();
  console.log('\n✅ Toutes les requêtes fonctionnent correctement !');
}
test().catch(console.error);
