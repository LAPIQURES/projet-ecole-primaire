const http = require('http');
const options = { host: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET', timeout: 5000 };
const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => console.log('BODY', data));
});
req.on('error', (e) => console.error('ERROR', e.message));
req.on('timeout', () => { console.error('TIMEOUT'); req.destroy(); });
req.end();
