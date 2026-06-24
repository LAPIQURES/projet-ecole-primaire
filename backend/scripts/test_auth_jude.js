const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email: 'jude', password: '1234' });
    console.log('STATUS', res.status);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('STATUS', err.response.status);
      console.error(JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
})();
