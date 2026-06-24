const http = require('http');
const options = {
  host: '127.0.0.1',
  port: 5000,
  path: '/api/eleves',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer dev:admin:1',
    'Accept': 'application/json'
  },
  timeout: 10000
};

const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', res.headers);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body || '[]');
      console.log('BODY', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('BODY (raw)', body);
    }
    process.exit(0);
  });
});

req.on('error', (e) => { console.error('ERROR', e.message); process.exit(1); });
req.on('timeout', () => { console.error('TIMEOUT'); req.destroy(); process.exit(1); });
req.end();
