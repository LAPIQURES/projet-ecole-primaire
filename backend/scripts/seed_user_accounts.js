const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
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

async function seed() {
  const conn = await mysql.createConnection(dbConfig);
  const password = '1234';
  const hash = await bcrypt.hash(password, 10);

  console.log('🔌 Connecté à la base de données');

  // 1. Admin jude
  const [admins] = await conn.query('SELECT ID FROM Admin WHERE username = ? LIMIT 1', ['jude']);
  if (admins.length > 0) {
    await conn.query('UPDATE Admin SET password = ?, typeAdmin = 1 WHERE username = ?', [hash, 'jude']);
    console.log('✅ Admin "jude" mis à jour.');
  } else {
    await conn.query('INSERT INTO Admin (username, password, typeAdmin, nom, createdAt, updatedAt) VALUES (?, ?, 1, ?, NOW(), NOW())', ['jude', hash, 'Admin Jude']);
    console.log('✅ Admin "jude" créé.');
  }

  // Fonction utilitaire pour créer une Personne
  async function ensurePersonne(username, typePersonne, nom) {
    const [people] = await conn.query('SELECT idPers FROM Personne WHERE login = ? OR username = ? LIMIT 1', [username, username]);
    let idPers;
    if (people.length > 0) {
      idPers = people[0].idPers;
      await conn.query('UPDATE Personne SET password = ?, typePersonne = ?, nom = ?, login = ?, username = ? WHERE idPers = ?', [hash, typePersonne, nom, username, username, idPers]);
      console.log(`♻️  Personne "${username}" (type ${typePersonne}) mise à jour.`);
    } else {
      const [next] = await conn.query('SELECT COALESCE(MAX(idPers),0)+1 AS nextId FROM Personne');
      idPers = next[0].nextId;
      await conn.query('INSERT INTO Personne (idPers, username, login, password, typePersonne, nom, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', [idPers, username, username, hash, typePersonne, nom]);
      console.log(`✅ Personne "${username}" (type ${typePersonne}) créée.`);
    }
    return idPers;
  }

  // On récupère l'idAdmin de jude pour l'insertion
  const [adminRows] = await conn.query('SELECT ID FROM Admin WHERE username = "jude" LIMIT 1');
  const idAdmin = adminRows.length > 0 ? adminRows[0].ID : 1;

  // 2. Enseignant lapiqure (typePersonne = 2)
  const idEns = await ensurePersonne('lapiqure', 2, 'Prof Lapiqure');
  const [enseignants] = await conn.query('SELECT idEnseignant FROM Enseignant WHERE idPers = ? LIMIT 1', [idEns]);
  if (enseignants.length === 0) {
    const [cours] = await conn.query('SELECT idCours FROM Cours LIMIT 1');
    const idCours = cours.length > 0 ? cours[0].idCours : 1;
    await conn.query('INSERT INTO Enseignant (idPers, Actif, idCours, idAdmin) VALUES (?, 1, ?, ?)', [idEns, idCours, idAdmin]);
  }

  // 3. Parent junior (typePersonne = 3)
  const idParentPers = await ensurePersonne('junior', 3, 'Parent Junior');
  const [parents] = await conn.query('SELECT idParent FROM Parents WHERE idPers = ? LIMIT 1', [idParentPers]);
  if (parents.length === 0) {
    const [eleves] = await conn.query('SELECT matricule FROM Eleve LIMIT 1');
    const matricule = eleves.length > 0 ? eleves[0].matricule : 'TEST001';
    await conn.query('INSERT INTO Parents (idPers, idAdmin, matricule) VALUES (?, ?, ?)', [idParentPers, idAdmin, matricule]);
  }

  await conn.end();
  console.log('\\n🎉 Comptes créés avec succès !');
}

seed().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
