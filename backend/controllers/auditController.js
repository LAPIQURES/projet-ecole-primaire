const pool = require('../database/db');

exports.listLogs = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(
      `SELECT id, userId, userLabel, action, targetType, targetId, details, created_at FROM ActionsLog ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur audit list:', error.message);
    res.status(500).json({ error: error.message });
  }
};
