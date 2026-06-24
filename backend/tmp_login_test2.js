const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/login', { email: 'jude', password: '1234' }, { timeout: 5000 });
    console.log('RESPONSE_JSON');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('HTTP_ERROR', err.response.status, err.response.data);
    } else {
      console.error('ERROR', err.message);
    }
    process.exit(1);
  }
})();
