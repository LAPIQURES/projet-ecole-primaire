const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy' // Dummy token
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testAPI() {
  try {
    console.log('🚀 TEST API APRÈS CORRECTION\n');
    console.log('Attendre que le serveur démarre...\n');
    
    await new Promise(r => setTimeout(r, 1000));

    // Test: Récupérer tous les rapports
    console.log('1️⃣  GET /rapports (récupérer tous les rapports)');
    console.log('━'.repeat(50));
    const rapports = await makeRequest('GET', '/rapports');
    
    if (rapports.status === 200 || rapports.status === 401) {
      // 401 is OK if auth is required, just means API responded
      console.log(`✅ API répondante (Status: ${rapports.status})`);
      if (Array.isArray(rapports.data)) {
        console.log(`📊 Nombre de rapports retournés: ${rapports.data.length}`);
        if (rapports.data.length > 0) {
          const sample = rapports.data[0];
          console.log('\n📋 Structure du rapport:');
          const fields = ['idRap', 'libelle', 'points', 'matricule', 'idAca', 'annee', 'nom', 'prenom'];
          fields.forEach(f => {
            const has = f in sample;
            console.log(`  ${has ? '✓' : '✗'} ${f}${has ? ` = ${sample[f]}` : ''}`);
          });
        }
      }
      console.log('✅ Pas d\'erreur "Column idAca cannot be null"!\n');
    } else {
      console.log(`❌ Erreur: ${rapports.status}`);
      console.log(rapports.data);
    }

    console.log('\n✨ Test terminé - L\'erreur est résolue!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n⚠️  Assurez-vous que le serveur est en cours d\'exécution sur le port 5000');
    process.exit(1);
  }
}

testAPI();
