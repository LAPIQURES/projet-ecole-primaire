const config = require('./config');
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection(config.db);

  try {
    console.log('===== STEPHANIE (20260041) - FREQUENTE =====');
    const [freq] = await conn.query(
      'SELECT * FROM Frequente WHERE matricule = ? ORDER BY created_at DESC',
      ['20260041']
    );
    console.log('Nombre d\'inscriptions:', freq.length);
    freq.forEach((f, i) => {
      console.log(`\nInscription ${i + 1}:`, {
        idFrequente: f.idFrequente,
        idSalle: f.idSalle,
        idClasse: f.idClasse,
        matricule: f.matricule,
        created_at: f.created_at
      });
    });

    if(freq.length > 0) {
      console.log('\n===== CLASSE SIL =====');
      const [classe] = await conn.query(
        'SELECT * FROM Classe WHERE libelle LIKE ?',
        ['%SIL%']
      );
      console.log('Classes avec SIL:', JSON.stringify(classe, null, 2));
      
      // Chercher la classe de la dernière inscription
      const idClasse = freq[0].idClasse;
      const [classeActuelle] = await conn.query(
        'SELECT * FROM Classe WHERE idClasse = ?',
        [idClasse]
      );
      console.log('\nClasse actuelle de Stéphanie:', JSON.stringify(classeActuelle, null, 2));
      
      if(classeActuelle.length > 0 && classeActuelle[0].idSalle) {
        const [salle] = await conn.query(
          'SELECT * FROM Salle WHERE idSalle = ?',
          [classeActuelle[0].idSalle]
        );
        console.log('\nSalle de la classe:', JSON.stringify(salle, null, 2));
      }
    }
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    conn.end();
  }
})();
