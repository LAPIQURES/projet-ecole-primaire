const axios = require('axios');

const devToken = 'dev:admin:1';
const baseURL = 'http://localhost:5000';

async function createEnseignantPiqure() {
  try {
    console.log('Creating enseignant "piqure" with password "1234"...\n');

    const response = await axios.post(
      `${baseURL}/api/enseignants`,
      {
        nom: 'PIQURE',
        prenom: 'Test',
        username: 'piqure',
        password: '1234',
        mobile: '+237690000000',
        email: 'piqure@ecole.cm',
        dateNaissance: '1990-01-01',
        lieuNaissance: 'Yaoundé'
      },
      {
        headers: {
          'Authorization': `Bearer ${devToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('STATUS', response.status);
    console.log('BODY', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('ERROR:', error.response?.status);
    console.error('ERROR BODY:', JSON.stringify(error.response?.data, null, 2));
  }
}

createEnseignantPiqure();
