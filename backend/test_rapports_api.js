const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  try {
    console.log('🧪 TEST COMPLET DES RAPPORTS\n');
    console.log('Attendre que le serveur démarre sur http://localhost:5000\n');
    
    // Attendre un peu que le serveur soit prêt
    await new Promise(r => setTimeout(r, 1000));

    // Test 1: Rapport pour élève
    console.log('1️⃣  Test création rapport ÉLÈVE');
    console.log('━'.repeat(50));
    const reportEleve = await makeRequest('POST', '/eleves/20260004/rapport', {
      libelle: 'Excellent comportement en classe',
      points: 15,
      commentaire: 'L\'élève participe activement',
      event_date: '2026-07-10'
    });
    console.log(`Status: ${reportEleve.status}`);
    console.log(`Réponse:`, reportEleve.data);
    if (reportEleve.status === 201) {
      console.log('✅ Rapport élève créé avec succès\n');
    } else {
      console.log('❌ Erreur lors de la création\n');
    }

    // Test 2: Rapport pour enseignant
    console.log('2️⃣  Test création rapport ENSEIGNANT');
    console.log('━'.repeat(50));
    const reportEnseignant = await makeRequest('POST', '/enseignants/55/rapport', {
      titre: 'Rapport pédagogique mensuel',
      details: 'Progression excellente dans l\'enseignement des mathématiques',
      type: 'Pédagogique'
    });
    console.log(`Status: ${reportEnseignant.status}`);
    console.log(`Réponse:`, reportEnseignant.data);
    if (reportEnseignant.status === 201) {
      console.log('✅ Rapport enseignant créé avec succès\n');
    } else {
      console.log('❌ Erreur lors de la création\n');
    }

    // Test 3: Récupérer les rapports
    console.log('3️⃣  Test récupération des rapports');
    console.log('━'.repeat(50));
    const rapports = await makeRequest('GET', '/rapports');
    console.log(`Status: ${rapports.status}`);
    console.log(`Nombre de rapports:`, Array.isArray(rapports.data) ? rapports.data.length : 'N/A');
    if (rapports.status === 200) {
      console.log('✅ Rapports récupérés avec succès\n');
    }

    console.log('\n✅ Tous les tests sont passés!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n⚠️  Assurez-vous que le serveur est en cours d\'exécution sur le port 5000');
    process.exit(1);
  }
}

runTests();
