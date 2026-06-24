const jwt = require('jsonwebtoken');
const config = require('./config');
try {
  const token = jwt.sign({ id: 1, login: 'jude', role: 'admin' }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  console.log('TOKEN_OK', token ? true : false);
} catch (e) {
  console.error('JWT_ERR', e.message);
  process.exit(1);
}
