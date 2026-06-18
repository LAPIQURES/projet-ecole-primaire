const http = require('http');

http.get('http://localhost:5000/api/messages/groups', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try { console.log(JSON.stringify(JSON.parse(data), null, 2)); } catch (e) { console.log(data); }
    process.exit(0);
  });
}).on('error', (err) => { console.error('Err:', err.message); process.exit(1); });
