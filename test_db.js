const { Client } = require('pg');

const client = new Client({
  host: '163.123.182.89',
  port: 17705,
  user: 'ecole',
  password: 'peda2026',
  database: 'ecole2026',
  connectionTimeoutMillis: 10000
});

(async () => {
  try {
    console.log('🔌 Tentative de connexion à la BD...');
    await client.connect();
    console.log('✅ CONNECTÉ AVEC SUCCÈS!');
    
    // Récupérer les tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 TABLES TROUVÉES:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
  } finally {
    await client.end();
  }
})();
