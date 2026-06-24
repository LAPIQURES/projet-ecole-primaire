const http = require('http');
const data = JSON.stringify({ email: 'jude', password: '1234' });
const options = { host: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }, timeout: 10000 };
const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  let body = '';
  res.on('data', d=> body += d);
  res.on('end', ()=> console.log('BODY', body));
});
req.on('error', e=> console.error('ERROR', e.message));
req.on('timeout', ()=> { console.error('TIMEOUT'); req.destroy(); });
req.write(data);
req.end();
