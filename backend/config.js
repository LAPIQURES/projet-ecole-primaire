const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPaths = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '..', '.env.local'),
  path.resolve(__dirname, '.env.local'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: envPath.endsWith('.local') });
  }
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  db: {
    host: process.env.DB_HOST || '163.123.183.89',
    port: Number(process.env.DB_PORT) || 17705,
    user: process.env.DB_USER || 'ecole',
    password: process.env.DB_PASSWORD || 'peda2026',
    database: process.env.DB_NAME || 'ecole2026'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '24h'
  }
};
