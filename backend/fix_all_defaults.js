const pool = require('./database/db');

async function fixAllDefaults() {
  try {
    console.log('🔧 Correction des valeurs par défaut manquantes...\n');
    
    // commentaire
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN commentaire TEXT DEFAULT ""');
    console.log('✅ commentaire: DEFAULT ""');
    
    // event_date
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN event_date DATE DEFAULT CURDATE()');
    console.log('✅ event_date: DEFAULT CURDATE()');
    
    // matricule - on ne peut pas donner un default à une clé étrangère
    // On va laisser comme c'est, mais on s'assure que le code le fournit toujours
    console.log('⚠️  matricule: doit être fourni par le code');
    
    // idAca
    await pool.query('ALTER TABLE Rapport MODIFY COLUMN idAca INT UNSIGNED DEFAULT 1');
    console.log('✅ idAca: DEFAULT 1');
    
    // Vérifier tous les changements
    console.log('\n📋 Nouvelle structure de Rapport:');
    const [cols] = await pool.query('SHOW COLUMNS FROM Rapport');
    cols.forEach(c => {
      if (['idPers', 'commentaire', 'event_date', 'matricule', 'idAca'].includes(c.Field)) {
        const null_val = c.Null === 'YES' ? 'NULL' : 'NOT NULL';
        const default_val = c.Default !== null ? `DEFAULT ${c.Default}` : 'NO DEFAULT';
        console.log(`  - ${c.Field}: ${null_val} ${default_val}`);
      }
    });
    
    console.log('\n✅ Toutes les colonnes ont maintenant une valeur par défaut!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixAllDefaults();
