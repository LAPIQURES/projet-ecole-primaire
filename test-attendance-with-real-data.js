const axios = require('axios');

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

(async () => {
  try {
    // Login
    const loginRes = await API.post('/auth/login', {
      login: 'jude',
      password: '1234'
    });
    const token = loginRes.data.token;
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // First get a valid student
    console.log('1. Getting students...');
    const elevesRes = await API.get('/eleves');
    if (elevesRes.data.length > 0) {
      const student = elevesRes.data[0];
      console.log(`   Found: ${student.nom} ${student.prenom} (matricule: ${student.matricule})`);
      
      // Try to mark attendance for this student
      console.log(`\n2. Marking attendance for ${student.matricule}...`);
      const markRes = await API.post('/eleves/mark-attendance', {
        matricule: student.matricule,
        idSalle: student.idSalle || 14,
        commentaire: 'RAS'
      });
      console.log('✅ Success!');
      console.log('   ', markRes.data);
    } else {
      console.log('❌ No students found in database');
    }
    
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
})();
