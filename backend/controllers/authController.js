const pool = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const roleMap = {
	1: 'superadmin',
	2: 'admin',
	3: 'enseignant',
	4: 'parent',
	5: 'directeur',
	6: 'intendant',
};

exports.login = async (req, res) => {
	try {
		const { login, password } = req.body;
		if (!login || !password) return res.status(400).json({ message: 'login et password requis' });

		// Try Admin table first (Admin table uses `username` column)
		const [admins] = await pool.query('SELECT * FROM Admin WHERE username = ? LIMIT 1', [login]);
		if (admins && admins.length) {
			const admin = admins[0];
			const hash = admin.password || admin.pass || '';
			const ok = hash && hash.startsWith('$2') ? await bcrypt.compare(password, hash) : password === hash;
			if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });
			const role = roleMap[admin.typeAdmin] || 'admin';
			const token = jwt.sign({ id: admin.ID || admin.id, login: admin.login || admin.username, role, typeAdmin: admin.typeAdmin }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
			return res.json({ token, user: { id: admin.ID || admin.id, login: admin.login || admin.username, role, typeAdmin: admin.typeAdmin } });
		}

		// Fallback to Personne
		const [people] = await pool.query('SELECT * FROM Personne WHERE username = ? OR login = ? LIMIT 1', [login, login]);
		if (people && people.length) {
			const p = people[0];
			const hash = p.password || p.pass || '';
			const ok = hash && hash.startsWith('$2') ? await bcrypt.compare(password, hash) : password === hash;
			if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });
			const role = p.typePersonne === 2 ? 'enseignant' : p.typePersonne === 3 ? 'parent' : 'personne';
			const token = jwt.sign({ id: p.idPers || p.ID || p.id, login: p.username || p.login, role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
			return res.json({ token, user: { id: p.idPers || p.ID || p.id, login: p.username || p.login, role } });
		}

		return res.status(401).json({ message: 'Utilisateur introuvable' });
	} catch (err) {
		console.error('login error', err && err.message ? err.message : err);
		return res.status(500).json({ message: 'Erreur serveur' });
	}
};

exports.me = async (req, res) => {
	return res.json({ user: req.user || null });
};

exports.signup = async (req, res) => {
	try {
		const { role, nom, prenom, username, email, password } = req.body;
		if (!username || !password || !nom || !prenom) return res.status(400).json({ error: 'Champs requis manquants' });
		const [next] = await pool.query('SELECT COALESCE(MAX(idPers),0)+1 AS nextId FROM Personne');
		const idPers = next[0]?.nextId || Date.now();
		const hashed = await bcrypt.hash(password, 10);
		const typePersonne = role === 'enseignant' ? 2 : role === 'parent' ? 3 : 1;
		await pool.query('INSERT INTO Personne (idPers, nom, prenom, username, password, typePersonne, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [idPers, nom, prenom, username, hashed, typePersonne]);
		if (role === 'enseignant') {
			await pool.query('INSERT INTO Enseignant (idPers, Actif, created_at) VALUES (?, 1, NOW())', [idPers]);
		}
		return res.status(201).json({ message: 'Compte créé' });
	} catch (err) {
		console.error('signup error', err && err.message ? err.message : err);
		return res.status(500).json({ error: 'Erreur serveur' });
	}
};


