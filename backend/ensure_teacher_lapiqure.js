const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const config = require('./config');

(async () => {
  const connection = await mysql.createConnection(config.db);

  try {
    const [rows] = await connection.execute('SELECT * FROM Personne WHERE username = ? LIMIT 1', ['lapiqure']);

    if (rows.length > 0) {
      const person = rows[0];
      console.log('✅ Utilisateur lapiqure trouvé dans Personne');
      console.log(JSON.stringify({
        idPers: person.idPers,
        username: person.username,
        typePersonne: person.typePersonne,
        nom: person.nom,
        prenom: person.prenom
      }, null, 2));

      const newHash = await bcrypt.hash('1234', 10);
      await connection.execute(
        'UPDATE Personne SET password = ?, typePersonne = 2 WHERE idPers = ?',
        [newHash, person.idPers]
      );

      const [teacherRows] = await connection.execute('SELECT idEnseignant FROM Enseignant WHERE idPers = ? LIMIT 1', [person.idPers]);
      if (teacherRows.length === 0) {
        await connection.execute(
          'INSERT INTO Enseignant (idPers, idCours, Actif, idAdmin, created_at) VALUES (?, NULL, 1, ?, NOW())',
          [person.idPers, 1]
        );
        console.log('✅ Ligne Enseignant créée');
      } else {
        console.log('✅ Ligne Enseignant déjà présente');
      }

      console.log('✅ Mot de passe mis à jour à 1234');
    } else {
      const [nextId] = await connection.execute('SELECT COALESCE(MAX(idPers), 0) + 1 AS nextId FROM Personne');
      const idPers = nextId[0].nextId;
      const hashedPassword = await bcrypt.hash('1234', 10);

      await connection.execute(
        `INSERT INTO Personne (idPers, nom, prenom, mobile, phone, username, password, dateNaissance, lieuNaissance, typePersonne, idAdmin, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, '2000-01-01', '', 2, ?, NOW())`,
        [idPers, 'Lapiqure', ' ', '', '', 'lapiqure', hashedPassword, 1]
      );

      await connection.execute(
        'INSERT INTO Enseignant (idPers, idCours, Actif, idAdmin, created_at) VALUES (?, NULL, 1, ?, NOW())',
        [idPers, 1]
      );

      console.log('✅ Utilisateur lapiqure créé comme enseignant avec le mot de passe 1234');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
})();
