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
    
    // Try to mark attendance with detailed error
    console.log('Testing mark-attendance endpoint...');
    try {
      const res = await API.post('/eleves/mark-attendance', {
        matricule: 'CM-2026-004',
        idSalle: 14,
        commentaire: 'RAS'
      });
      console.log('✅ Success:', res.data);
    } catch (err) {
      console.log('❌ Error:', err.response?.status);
      console.log('Error data:', err.response?.data);
      console.log('Error message:', err.message);
    }
    
  } catch (err) {
    console.error('Critical error:', err.message);
  }
})();
