const axios = require('axios');

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Set token if available
const token = 'test-token'; // Will use API defaults
if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

const tests = {
  async testParentData() {
    console.log('\n🔍 TEST 1: Real Parent Data');
    try {
      const res = await API.get('/eleves/CM-2026-004/parents');
      console.log(`  ✅ Parents endpoint works`);
      console.log(`  📊 Found ${res.data.length} parent(s)`);
      if (res.data.length > 0) {
        console.log(`  👤 Parent 1: ${res.data[0].prenom} ${res.data[0].nom}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.response?.status} - ${err.message}`);
    }
  },

  async testAttendanceData() {
    console.log('\n🔍 TEST 2: Real Attendance Data');
    try {
      const month = new Date().toISOString().substring(0, 7); // YYYY-MM
      const res = await API.get(`/eleves/CM-2026-004/attendance?month=${month}`);
      console.log(`  ✅ Attendance endpoint works`);
      console.log(`  📊 Found ${res.data.length} attendance record(s)`);
      if (res.data.length > 0) {
        console.log(`  📅 Latest: ${res.data[0].date} - ${res.data[0].status}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.response?.status} - ${err.message}`);
    }
  },

  async testMarkAttendance() {
    console.log('\n🔍 TEST 3: Teacher Mark Attendance');
    try {
      const res = await API.post('/eleves/mark-attendance', {
        matricule: 'CM-2026-004',
        idSalle: 1,
        commentaire: 'RAS'
      });
      console.log(`  ✅ Mark attendance endpoint works`);
      console.log(`  📊 Status: ${res.data.status}`);
    } catch (err) {
      console.log(`  ❌ Error: ${err.response?.status} - ${err.message}`);
    }
  },

  async testDisciplineModule() {
    console.log('\n🔍 TEST 4: Admin Discipline Module');
    try {
      const res = await API.get('/discipline/absences/list?month=6&year=2026');
      console.log(`  ✅ Discipline absences endpoint works`);
      console.log(`  📊 Found ${res.data.length} absence record(s)`);
      if (res.data.length > 0) {
        console.log(`  👤 Latest: ${res.data[0].eleveNom} - ${res.data[0].status}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.response?.status} - ${err.message}`);
    }
  }
};

(async () => {
  console.log('🚀 TESTING ALL 4 FEATURES');
  console.log('='.repeat(50));
  
  await tests.testParentData();
  await tests.testAttendanceData();
  await tests.testMarkAttendance();
  await tests.testDisciplineModule();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All API endpoints tested!');
})();
