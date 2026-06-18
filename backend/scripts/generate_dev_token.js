const jwt = require('jsonwebtoken');
const config = require('../config');
// Simple argv parsing to avoid extra deps
const rawArgs = process.argv.slice(2);
const argv = rawArgs.reduce((acc, cur, idx, arr) => {
	if (cur.startsWith('--')) {
		const key = cur.replace(/^--/, '');
		const next = arr[idx + 1];
		if (next && !next.startsWith('--')) acc[key] = next;
		else acc[key] = true;
	}
	return acc;
}, {});

const role = argv.role || 'enseignant';
const id = argv.id || 1;
const expiresIn = argv.expiresIn || config.jwt.expiresIn || '24h';

const payload = { id: Number(id), role };
const token = jwt.sign(payload, config.jwt.secret, { expiresIn });

console.log('DEV_PREFIX_TOKEN:', `dev:${role}:${id}`);
console.log('SIGNED_JWT:', token);
console.log('\nUsage examples:');
console.log(`- Use dev prefix directly in Authorization header: Authorization: Bearer dev:${role}:${id}`);
console.log(`- Use signed JWT: Authorization: Bearer ${token}`);
