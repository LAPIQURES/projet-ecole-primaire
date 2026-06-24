const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '163.123.183.89',
      port: 17705,
      user: 'ecole',
      password: 'peda2026',
      database: 'ecole2026'
    });
    
    console.log('=== EmploiDuTemps Table Structure ===');
    const [columns] = await conn.query('DESCRIBE EmploiDuTemps');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });
    
    console.log('\n=== Sample EmploiDuTemps Data ===');
    const [rows] = await conn.query(`
      SELECT 
        e.idTemps, e.idEnseignant, e.idCours, e.idClasse, e.idSalle,
        e.jour, e.heure, e.duree,
        ens.idPers, p.nom, p.prenom,
        c.libelle AS coursLibelle,
        cl.libelle AS classeLibelle,
        s.libelle AS salleLibelle
      FROM EmploiDuTemps e
      LEFT JOIN Enseignant ens ON ens.idEnseignant = e.idEnseignant
      LEFT JOIN Personne p ON p.idPers = ens.idPers
      LEFT JOIN Cours c ON c.idCours = e.idCours
      LEFT JOIN Classe cl ON cl.idClasse = e.idClasse
      LEFT JOIN Salle s ON s.idSalle = e.idSalle
      LIMIT 5
    `);
    
    console.log(`Found ${rows.length} schedule entries`);
    rows.forEach(r => {
      console.log(`\n  Teacher: ${r.prenom} ${r.nom} (idEnseignant: ${r.idEnseignant})`);
      console.log(`  Course: ${r.coursLibelle} (${r.idCours})`);
      console.log(`  Day: ${r.jour}, Time: ${r.heure}`);
      console.log(`  Class: ${r.classeLibelle}, Room: ${r.salleLibelle}`);
    });
    
    // Check for "atangana"
    console.log('\n=== Looking for "atangana" ===');
    const [atangana] = await conn.query(`
      SELECT ens.idEnseignant, p.nom, p.prenom
      FROM Enseignant ens
      JOIN Personne p ON p.idPers = ens.idPers
      WHERE LOWER(p.nom) LIKE '%atangana%' OR LOWER(p.prenom) LIKE '%atangana%'
    `);
    
    if (atangana.length) {
      const ens = atangana[0];
      console.log(`Found teacher: ${ens.prenom} ${ens.nom} (idEnseignant: ${ens.idEnseignant})`);
      
      const [schedule] = await conn.query(`
        SELECT idTemps, jour, heure, idCours, idClasse, idSalle
        FROM EmploiDuTemps
        WHERE idEnseignant = ?
      `, [ens.idEnseignant]);
      
      console.log(`Schedule slots: ${schedule.length}`);
      schedule.forEach(s => {
        console.log(`  - Day ${s.jour}, Time ${s.heure}, Course: ${s.idCours}`);
      });
    } else {
      console.log('Not found');
    }
    
    await conn.end();
  } catch (err) {
    console.error('ERROR:', err.message);
  }
})();
