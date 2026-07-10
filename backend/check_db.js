const m = require('mysql2/promise');
m.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'',database:'ecole2026'}).then(async c => {
  const [r] = await c.query('DESCRIBE EmploiDuTemps');
  const heure = r.find(x => x.Field === 'heure');
  console.log('heure column:', heure);

  const [t1] = await c.query("SHOW TABLES LIKE 'Personnel'");
  console.log('Personnel exists:', t1.length > 0);

  const [t2] = await c.query("SHOW TABLES LIKE 'Poste'");
  console.log('Poste exists:', t2.length > 0);

  const [t3] = await c.query("SHOW TABLES LIKE 'Fonction'");
  console.log('Fonction exists:', t3.length > 0);

  if (t2.length > 0) {
    const [postes] = await c.query('SELECT * FROM Poste');
    console.log('Postes:', postes);
  }
  if (t3.length > 0) {
    const [fonctions] = await c.query('SELECT * FROM Fonction');
    console.log('Fonctions:', fonctions);
  }

  await c.end();
}).catch(console.error);
