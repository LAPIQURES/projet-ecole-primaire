const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { verifyAdmin } = require('../middleware/auth');

// Keep simple admin creation/update endpoint
router.post('/create', verifyAdmin(['superadmin','admin']), async (req, res) => {
  const { login, password, typeAdmin } = req.body;
  if (!login || !password || typeAdmin === undefined) return res.status(400).json({ message: 'login, password, typeAdmin requis' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const [existing] = await pool.query('SELECT ID FROM Admin WHERE login = ? LIMIT 1', [login]);
    if (existing.length) {
      await pool.query('UPDATE Admin SET password = ?, typeAdmin = ? WHERE ID = ?', [hash, typeAdmin, existing[0].ID]);
      return res.json({ message: 'Admin mis à jour' });
    }
    await pool.query('INSERT INTO Admin (login, password, typeAdmin, actif, createdAt) VALUES (?, ?, ?, 1, NOW())', [login, hash, typeAdmin]);
    return res.json({ message: 'Admin créé' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// List admins
router.get('/', verifyAdmin(['superadmin','admin']), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT ID, login, typeAdmin FROM Admin ORDER BY ID DESC');
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Admin login (used by admin UI if needed)
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ error: 'Login et mot de passe requis' });
    const [rows] = await pool.query('SELECT * FROM Admin WHERE login = ? LIMIT 1', [login]);
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' });
    const admin = rows[0];
    const valid = admin.password && admin.password.startsWith('$2') ? await bcrypt.compare(password, admin.password) : password === admin.password;
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });
    const role = admin.typeAdmin === 1 ? 'superadmin' : admin.typeAdmin === 5 ? 'directeur' : admin.typeAdmin === 6 ? 'intendant' : 'admin';
    const token = jwt.sign({ id: admin.ID || admin.id, login: admin.login || admin.username, role, typeAdmin: admin.typeAdmin }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    return res.json({ success: true, token, user: { id: admin.ID || admin.id, login: admin.login || admin.username, role, typeAdmin: admin.typeAdmin } });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Profile
router.get('/me', verifyAdmin(['admin','superadmin','directeur','intendant']), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT ID, login, username, typeAdmin, actif, createdAt, updatedAt FROM Admin WHERE ID = ?', [req.user.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Admin non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Admin me error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Change password
router.put('/password', verifyAdmin(['admin','superadmin','directeur','intendant']), async (req, res) => {
  try {
    const { ancienPassword, nouveauPassword, confirmation } = req.body;
    if (!ancienPassword || !nouveauPassword || !confirmation) return res.status(400).json({ error: 'Tous les champs sont requis' });
    if (nouveauPassword !== confirmation) return res.status(400).json({ error: 'Les nouveaux mots de passe ne correspondent pas' });
    if (nouveauPassword.length < 6) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    const [rows] = await pool.query('SELECT password FROM Admin WHERE ID = ?', [req.user.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Admin non trouvé' });
    const admin = rows[0];
    const valid = admin.password && admin.password.startsWith('$2') ? await bcrypt.compare(ancienPassword, admin.password) : ancienPassword === admin.password;
    if (!valid) return res.status(400).json({ error: 'Ancien mot de passe incorrect' });
    const hashed = await bcrypt.hash(nouveauPassword, 10);
    await pool.query('UPDATE Admin SET password = ? WHERE ID = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (err) {
    console.error('Admin password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', verifyAdmin(['admin','superadmin','directeur','intendant']), (req, res) => {
  res.json({ success: true, message: 'Déconnecté' });
});

module.exports = router;
