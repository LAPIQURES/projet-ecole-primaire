const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');
const config = require('../config');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, login, password } = req.body;
    const credential = login || username;
    if (!credential || !password) {
      return res.status(400).json({ error: 'Login et mot de passe requis' });
    }

    // Query Admin table using login or username
    const [rows] = await pool.query(
      'SELECT * FROM Admin WHERE (login = ? OR username = ?) AND actif = 1',
      [credential, credential]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const admin = rows[0];

    // Verify password
    const validPassword = admin.password.startsWith('$2')
      ? await bcrypt.compare(password, admin.password)
      : password === admin.password;

    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin.ID,
        login: admin.login,
        username: admin.username,
        role: admin.typeAdmin === 1 ? 'superadmin' : 'admin',
        type: 'admin',
        typeAdmin: admin.typeAdmin
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin.ID,
        login: admin.login,
        username: admin.username,
        role: admin.typeAdmin === 1 ? 'superadmin' : 'admin',
        type: 'admin',
        typeAdmin: admin.typeAdmin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/me - Get current admin profile
router.get('/me', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT ID, login, username, typeAdmin, actif, isDelete, createdAt, updatedAt, langue FROM Admin WHERE ID = ?',
      [req.user.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Admin non trouvé' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Admin me error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/password - Change password
router.put('/password', verifyAdmin, async (req, res) => {
  try {
    const { ancienPassword, nouveauPassword, confirmation } = req.body;

    if (!ancienPassword || !nouveauPassword || !confirmation) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (nouveauPassword !== confirmation) {
      return res.status(400).json({ error: 'Les nouveaux mots de passe ne correspondent pas' });
    }

    if (nouveauPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Get current admin
    const [rows] = await pool.query(
      'SELECT password FROM Admin WHERE ID = ?',
      [req.user.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Admin non trouvé' });
    }

    const admin = rows[0];

    // Verify old password
    const validPassword = admin.password.startsWith('$2')
      ? await bcrypt.compare(ancienPassword, admin.password)
      : ancienPassword === admin.password;

    if (!validPassword) {
      return res.status(400).json({ error: 'Ancien mot de passe incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(nouveauPassword, 10);

    // Update password
    await pool.query(
      'UPDATE Admin SET password = ? WHERE ID = ?',
      [hashedPassword, req.user.id]
    );

    res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (error) {
    console.error('Admin password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/logout - Logout
router.post('/logout', verifyAdmin, (req, res) => {
  // Token invalidation handled on client-side
  res.json({ success: true, message: 'Déconnecté' });
});

module.exports = router;
