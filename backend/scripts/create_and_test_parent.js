const pool = require('../database/db');
const bcrypt = require('bcrypt');
const axios = require('axios');

(async () => {
  try {
    const nom = 'Test';
    const prenom = 'Parent';
    const plainPassword = 'TestPass123';
    const matricule = null; // or set to an existing student matricule to link

    const [next] = await pool.query('SELECT COALESCE(MAX(idPers),0)+1 AS nextId FROM Personne');
    const idPers = next[0].nextId || Date.now();
    const username = `testparent${idPers}`;
    const hashed = await bcrypt.hash(plainPassword, 10);

    const idAdmin = 1000;
    await pool.query('INSERT INTO Personne (idPers, nom, prenom, username, password, typePersonne, idAdmin, created_at) VALUES (?, ?, ?, ?, ?, 3, ?, NOW())', [idPers, nom, prenom, username, hashed, idAdmin]);
    const [res] = await pool.query('INSERT INTO Parents (idPers, matricule, idAdmin, created_at) VALUES (?, "", ?, NOW())', [idPers, idAdmin]);
    if (matricule) {
      await pool.query('INSERT INTO ParentEleve (idPers, matricule) VALUES (?, ?)', [idPers, matricule]);
    }

    console.log('Created parent:', { idPers, username, plainPassword });

    // Try login
    const resp = await axios.post('http://localhost:5000/api/auth/login', { login: username, password: plainPassword });
    console.log('Login response status:', resp.status);
    console.log('Token present:', !!resp.data.token);
    console.log('User:', resp.data.user);

    await pool.end();
  } catch (e) {
    console.error('ERROR', e.response?.data || e.message || e);
    try { await pool.end(); } catch (e2) {}
    process.exit(1);
  }
})();
