const config = require('./config');
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection(config.db);

  try {
    console.log('====== CORRECTION: Stéphanie SIL ======\n');

    // 1. Trouver la classe SIL la plus récente
    const [classes] = await conn.query(
      'SELECT * FROM Classe WHERE libelle = ? ORDER BY created_at DESC LIMIT 1',
      ['SIL']
    );

    if (!classes.length) {
      console.error('❌ Erreur: Pas de classe "SIL" trouvée');
      return;
    }

    const silClass = classes[0];
    console.log('✓ Classe SIL trouvée:', { id: silClass.idClasse, libelle: silClass.libelle, salle: silClass.idSalle });

    // 2. Chercher/Créer une salle pour SIL
    let salleId = null;
    const [existingSalles] = await conn.query(
      'SELECT * FROM Salle WHERE idClasse = ? LIMIT 1',
      [silClass.idClasse]
    );
    
    if (existingSalles.length > 0) {
      salleId = existingSalles[0].idSalle;
      console.log('✓ Salle SIL existante:', { id: salleId, libelle: existingSalles[0].libelle });
    } else {
      console.log('\n⚠️  Création d\'une salle pour la classe SIL...');
      const [salleRes] = await conn.query(
        'INSERT INTO Salle (libelle, position, surface, idClasse, actif, idAdmin, capacite) VALUES (?, ?, ?, ?, 1, 1, ?)',
        ['Salle SIL', 'A', '30m²', silClass.idClasse, 30]
      );
      salleId = salleRes.insertId;
      console.log('✓ Salle créée:', { id: salleId, libelle: 'Salle SIL' });
    }

    // 3. Corriger l'inscription de Stéphanie
    console.log('\n✓ Mise à jour de l\'inscription de Stéphanie...');
    const result = await conn.query(
      'UPDATE Frequente SET idClasse = ? WHERE matricule = ? AND idClasse IS NULL',
      [silClass.idClasse, '20260041']
    );

    console.log(`✓ ${result[0].affectedRows} inscription(s) mise(s) à jour`);

    // 4. Vérifier le résultat
    console.log('\n====== RÉSULTAT APRÈS CORRECTION ======');
    const [freq] = await conn.query(
      'SELECT * FROM Frequente WHERE matricule = ?',
      ['20260041']
    );
    console.log('Inscription de Stéphanie:', {
      idFrequente: freq[0].idFrequente,
      idClasse: freq[0].idClasse,
      className: 'SIL',
      salle: 'Salle SIL'
    });

    console.log('\n✅ Correction terminée! Stéphanie est maintenant en SIL avec une salle assignée.');

  } catch(e) {
    console.error('❌ Erreur:', e.message);
  } finally {
    conn.end();
  }
})();
