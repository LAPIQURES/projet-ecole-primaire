const axios = require('axios');

const devToken = 'dev:admin:1';
const baseURL = 'http://localhost:5000/api';
const client = axios.create({ baseURL });

// Add authorization header
client.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${devToken}`;
  return config;
});

const results = [];

function logTest(route, method, status, data, error = null) {
  const result = {
    route,
    method,
    status,
    success: status >= 200 && status < 300,
    data: error || (typeof data === 'object' ? Object.keys(data).join(', ') : String(data).substring(0, 50)),
  };
  results.push(result);
  console.log(`[${status}] ${method} ${route} - ${result.success ? '✅' : '❌'} ${error ? 'ERROR: ' + error : ''}`);
}

async function runTests() {
  console.log('🧪 COMPREHENSIVE ADMIN DASHBOARD ENDPOINT TESTS\n');
  
  try {
    // AUTH ENDPOINTS
    console.log('\n📋 AUTHENTICATION ENDPOINTS');
    console.log('================================\n');

    try {
      const loginRes = await client.post('/auth/login', { username: 'jude', password: '1234' });
      logTest('/auth/login', 'POST', loginRes.status, { token: '***' }, null);
    } catch (e) {
      logTest('/auth/login', 'POST', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const meRes = await client.get('/auth/me');
      logTest('/auth/me', 'GET', meRes.status, meRes.data, null);
    } catch (e) {
      logTest('/auth/me', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    // ENSEIGNANTS ENDPOINTS
    console.log('\n📚 ENSEIGNANTS MANAGEMENT');
    console.log('================================\n');

    try {
      const ensRes = await client.get('/enseignants');
      logTest('/enseignants', 'GET', ensRes.status, ensRes.data, null);
    } catch (e) {
      logTest('/enseignants', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const ensRes = await client.get('/enseignants/1');
      logTest('/enseignants/:id', 'GET', ensRes.status, ensRes.data, null);
    } catch (e) {
      logTest('/enseignants/:id', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const createRes = await client.post('/enseignants', {
        nom: 'TEST2',
        prenom: 'Enseignant',
        username: 'test.ens2',
        password: 'test123',
        mobile: '+237690000003'
      });
      logTest('/enseignants', 'POST', createRes.status, createRes.data, null);
    } catch (e) {
      logTest('/enseignants', 'POST', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const updateRes = await client.put('/enseignants/47', {
        nom: 'PIQURE_UPDATED',
        prenom: 'Test',
        mobile: '+237690000002'
      });
      logTest('/enseignants/:id', 'PUT', updateRes.status, updateRes.data, null);
    } catch (e) {
      logTest('/enseignants/:id', 'PUT', e.response?.status, {}, e.response?.data?.error);
    }

    // ELEVES ENDPOINTS
    console.log('\n👥 ELEVES MANAGEMENT');
    console.log('================================\n');

    try {
      const elevesRes = await client.get('/eleves');
      logTest('/eleves', 'GET', elevesRes.status, elevesRes.data, null);
    } catch (e) {
      logTest('/eleves', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const eleveRes = await client.get('/eleves/20260014');
      logTest('/eleves/:id', 'GET', eleveRes.status, eleveRes.data, null);
    } catch (e) {
      logTest('/eleves/:id', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const createEleveRes = await client.post('/eleves', {
        nom: 'TEST_ELEVE',
        prenom: 'Nouveau',
        sexe: 1,
        dateNaissance: '2015-01-01',
        lieuNaissance: 'Yaoundé'
      });
      logTest('/eleves', 'POST', createEleveRes.status, createEleveRes.data, null);
    } catch (e) {
      logTest('/eleves', 'POST', e.response?.status, {}, e.response?.data?.error);
    }

    // CLASSES ENDPOINTS
    console.log('\n🏫 CLASSES MANAGEMENT');
    console.log('================================\n');

    try {
      const classesRes = await client.get('/classes');
      logTest('/classes', 'GET', classesRes.status, classesRes.data, null);
    } catch (e) {
      logTest('/classes', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const classeRes = await client.get('/classes/12');
      logTest('/classes/:id', 'GET', classeRes.status, classeRes.data, null);
    } catch (e) {
      logTest('/classes/:id', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    // SALLES ENDPOINTS
    console.log('\n🚪 SALLES MANAGEMENT');
    console.log('================================\n');

    try {
      const sallesRes = await client.get('/salles');
      logTest('/salles', 'GET', sallesRes.status, sallesRes.data, null);
    } catch (e) {
      logTest('/salles', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const salleRes = await client.get('/salles/13');
      logTest('/salles/:id', 'GET', salleRes.status, salleRes.data, null);
    } catch (e) {
      logTest('/salles/:id', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    // COURS ENDPOINTS
    console.log('\n📖 COURS MANAGEMENT');
    console.log('================================\n');

    try {
      const coursRes = await client.get('/cours');
      logTest('/cours', 'GET', coursRes.status, coursRes.data, null);
    } catch (e) {
      logTest('/cours', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const coursRes = await client.get('/cours/1');
      logTest('/cours/:id', 'GET', coursRes.status, coursRes.data, null);
    } catch (e) {
      logTest('/cours/:id', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    // STATS ENDPOINTS
    console.log('\n📊 DASHBOARD STATS');
    console.log('================================\n');

    try {
      const statsRes = await client.get('/years');
      logTest('/years', 'GET', statsRes.status, statsRes.data, null);
    } catch (e) {
      logTest('/years', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const statsRes = await client.get('/stats/dashboard');
      logTest('/stats/dashboard', 'GET', statsRes.status, statsRes.data, null);
    } catch (e) {
      logTest('/stats/dashboard', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const paiementsRes = await client.get('/stats/paiements-mensuel');
      logTest('/stats/paiements-mensuel', 'GET', paiementsRes.status, paiementsRes.data, null);
    } catch (e) {
      logTest('/stats/paiements-mensuel', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const inscriptionsRes = await client.get('/stats/inscriptions-mensuel');
      logTest('/stats/inscriptions-mensuel', 'GET', inscriptionsRes.status, inscriptionsRes.data, null);
    } catch (e) {
      logTest('/stats/inscriptions-mensuel', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    // PAIEMENTS ENDPOINTS
    console.log('\n💰 PAIEMENTS MANAGEMENT');
    console.log('================================\n');

    try {
      const paiementsRes = await client.get('/paiements');
      logTest('/paiements', 'GET', paiementsRes.status, paiementsRes.data, null);
    } catch (e) {
      logTest('/paiements', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    // RAPPORTS ENDPOINTS
    console.log('\n📄 RAPPORTS MANAGEMENT');
    console.log('================================\n');

    try {
      const rapportsRes = await client.get('/rapports');
      logTest('/rapports', 'GET', rapportsRes.status, rapportsRes.data, null);
    } catch (e) {
      logTest('/rapports', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const rapportsEnsRes = await client.get('/rapports/enseignants');
      logTest('/rapports/enseignants', 'GET', rapportsEnsRes.status, rapportsEnsRes.data, null);
    } catch (e) {
      logTest('/rapports/enseignants', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    // DISCIPLINARY ENDPOINTS
    console.log('\n⚠️  DISCIPLINE MANAGEMENT');
    console.log('================================\n');

    try {
      const disciplineRes = await client.get('/discipline');
      logTest('/discipline', 'GET', disciplineRes.status, disciplineRes.data, null);
    } catch (e) {
      logTest('/discipline', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    try {
      const disciplineStatsRes = await client.get('/discipline/stats');
      logTest('/discipline/stats', 'GET', disciplineStatsRes.status, disciplineStatsRes.data, null);
    } catch (e) {
      logTest('/discipline/stats', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    // MESSAGES ENDPOINTS
    console.log('\n💬 MESSAGES MANAGEMENT');
    console.log('================================\n');

    try {
      const messagesRes = await client.get('/messages');
      logTest('/messages', 'GET', messagesRes.status, messagesRes.data, null);
    } catch (e) {
      logTest('/messages', 'GET', e.response?.status, {}, e.response?.data?.error);
    }

    // SUMMARY REPORT
    console.log('\n\n📈 TEST SUMMARY');
    console.log('================================\n');
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`Total tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('Failed endpoints:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - [${r.status}] ${r.method} ${r.route}: ${r.data}`);
      });
    }

  } catch (error) {
    console.error('Test suite error:', error.message);
  }

  process.exit(0);
}

runTests();
