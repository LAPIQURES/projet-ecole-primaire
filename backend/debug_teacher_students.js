const axios = require('axios');
(async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/enseignants/me/students', {
      headers: { Authorization: 'Bearer dev:enseignant:92' }
    });
    console.log('status', res.status);
    console.log(JSON.stringify(res.data?.slice?.(0, 3) || res.data, null, 2));
  } catch (e) {
    if (e.response) {
      console.error('status', e.response.status);
      console.error(JSON.stringify(e.response.data, null, 2));
    } else {
      console.error(e.message);
    }
  }
})();
