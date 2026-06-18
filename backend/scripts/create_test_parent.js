const pool = require('../database/db');

async function create() {
  const username = process.env.USERNAME || 'parent.test';
  const password = process.env.PASSWORD || 'test1234';
  const matricule = process.env.MATRICULE || '96534672';
  try {
    const [next] = await pool.query('SELECT COALESCE(MAX(idPers),0)+1 AS nextId FROM Personne');
    const idPers = next[0]?.nextId || 1000;
    const idAdmin = 1000;

    // check duplicate username
    const [dupe] = await pool.query('SELECT idPers FROM Personne WHERE username = ? LIMIT 1', [username]);
    if (dupe.length) {
      console.error('Username already exists:', username);
      process.exit(1);
    }

    // insert Personne (typePersonne = 3 -> parent)
    await pool.query(
      `INSERT INTO Personne (idPers, nom, prenom, mobile, phone, username, password, dateNaissance, lieuNaissance, typePersonne, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, '2000-01-01', '', 3, ?, NOW())`,
      [idPers, 'Parent', 'Test', '', '', username, password, idAdmin]
    );

    const [res] = await pool.query('INSERT INTO Parents (idPers, matricule, idAdmin, created_at) VALUES (?, ?, ?, NOW())', [idPers, matricule, idAdmin]);

    console.log('Parent créé :', { idParent: res.insertId, idPers, username, password, matricule });
    process.exit(0);
  } catch (err) {
    console.error('Erreur création parent test :', err.message);
    process.exit(1);
  }
}

create();
