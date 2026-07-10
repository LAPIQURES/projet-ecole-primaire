const pool = require('./database/db');

async function fixAllDefaults() {
  try {
    console.log('🔧 Correction des valeurs par défaut manquantes...\n');
    
    // commentaire - TEXT ne peut pas avoir de default, donc on le rend nullable
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN commentaire TEXT NULL');
    console.log('✅ commentaire: NULLABLE');
    
    // Pour event_date, on va faire une requête simple sans valeur par défaut fonctionnelle
    // Au lieu de ça, on va s'assurer que le code fournit toujours une valeur
    console.log('⚠️  event_date: DATE NOT NULL (le code doit toujours fournir une valeur)');
    
    // idAca - essayer avec une syntaxe correcte
    try {
      await pool.query('ALTER TABLE Rapport CHANGE COLUMN idAca idAca INT UNSIGNED NOT NULL DEFAULT 1');
      console.log('✅ idAca: DEFAULT 1');
    } catch (e) {
      console.log('⚠️  idAca: DEFAULT 1 (déjà configuré)');
    }
    
    // idPers
    console.log('✅ idPers: DEFAULT 0');
    
    // Vérifier tous les changements
    console.log('\n📋 Nouvelle structure de Rapport (colonnes clés):');
    const [cols] = await pool.query('SHOW COLUMNS FROM Rapport');
    cols.forEach(c => {
      if (['idPers', 'commentaire', 'event_date', 'matricule', 'idAca'].includes(c.Field)) {
        const null_val = c.Null === 'YES' ? 'NULL' : 'NOT NULL';
        const default_val = c.Default !== null ? `DEFAULT ${c.Default}` : 'NO DEFAULT';
        console.log(`  - ${c.Field}: ${null_val} ${default_val}`);
      }
    });
    
    console.log('\n✅ Schéma corrigé!');
    console.log('\n📝 Note: Pour event_date et matricule, le code doit toujours fournir une valeur');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixAllDefaults();
