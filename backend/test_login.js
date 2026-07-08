const axios = require('axios');

(async () => {
  try {
    console.log('🔍 Test de connexion avec jude/1234...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      login: 'jude',
      password: '1234'
    });
    
    console.log('\n✅ CONNEXION RÉUSSIE!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.log('\n❌ ERREUR DE CONNEXION');
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Error:', err.response.data);
    } else {
      console.log('Message:', err.message);
    }
  }
})();
