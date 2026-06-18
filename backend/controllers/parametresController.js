const pool = require('../database/db');
const bcrypt = require('bcrypt');

const ensurePaymentModes = async () => {
  const [tables] = await pool.query("SHOW TABLES LIKE 'PaymentModes'");
  if (!tables.length) {
    await pool.query(`
      CREATE TABLE PaymentModes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(50) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }
};

ensurePaymentModes().catch((e) => console.error('Erreur ensurePaymentModes:', e.message));

exports.getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, username, mobile, phone } = req.body;
    if (req.user && req.user.type === 'admin') {
      await pool.query('UPDATE Admin SET nom = COALESCE(?, nom), username = COALESCE(?, username) WHERE username = ?', [nom || null, username || null, req.user.username]);
      return res.json({ message: 'Profil mis à jour' });
    }

    // personne
    await pool.query('UPDATE Personne SET nom = COALESCE(?, nom), prenom = COALESCE(?, prenom), mobile = COALESCE(?, mobile), phone = COALESCE(?, phone), username = COALESCE(?, username) WHERE idPers = ?', [nom || null, prenom || null, mobile || null, phone || null, username || null, req.user.id]);
    res.json({ message: 'Profil mis à jour' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Champs requis manquants' });

    if (req.user && (req.user.type === 'admin' || req.user.role === 'admin' || req.user.role === 'superadmin')) {
      const [rows] = await pool.query('SELECT * FROM Admin WHERE username = ? LIMIT 1', [req.user.username]);
      if (!rows.length) return res.status(404).json({ error: 'Administrateur introuvable' });
      const admin = rows[0];
      const ok = admin.password && admin.password.startsWith('$2') ? await bcrypt.compare(currentPassword, admin.password) : currentPassword === admin.password;
      if (!ok) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      const hash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE Admin SET password = ? WHERE username = ?', [hash, req.user.username]);
      return res.json({ message: 'Mot de passe mis à jour' });
    }

    const [pers] = await pool.query('SELECT * FROM Personne WHERE idPers = ? LIMIT 1', [req.user.id]);
    if (!pers.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const personne = pers[0];
    const okP = personne.password && personne.password.startsWith('$2') ? await bcrypt.compare(currentPassword, personne.password) : currentPassword === personne.password;
    if (!okP) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    const hashP = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE Personne SET password = ? WHERE idPers = ?', [hashP, req.user.id]);
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Payment modes CRUD
exports.getPaymentModes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, code, created_at FROM PaymentModes ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPaymentMode = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom requis' });
    const [result] = await pool.query('INSERT INTO PaymentModes (name, code, created_at) VALUES (?, ?, NOW())', [name, code || null]);
    const [rows] = await pool.query('SELECT id, name, code, created_at FROM PaymentModes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaymentMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    await pool.query('UPDATE PaymentModes SET name = COALESCE(?, name), code = COALESCE(?, code) WHERE id = ?', [name || null, code || null, id]);
    const [rows] = await pool.query('SELECT id, name, code, created_at FROM PaymentModes WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePaymentMode = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM PaymentModes WHERE id = ?', [id]);
    res.json({ message: 'Mode de paiement supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
