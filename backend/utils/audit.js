const pool = require('../database/db');

const ensureAuditTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ActionsLog (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(120) NULL,
      userLabel VARCHAR(180) NULL,
      action VARCHAR(60) NOT NULL,
      targetType VARCHAR(60) NULL,
      targetId VARCHAR(120) NULL,
      details TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const logAction = async (user, action, targetType, targetId, details) => {
  try {
    await ensureAuditTable();
    const userId = user?.id ? String(user.id) : (user?.username || null);
    const userLabel = user?.nom || user?.username || null;
    await pool.query(
      `INSERT INTO ActionsLog (userId, userLabel, action, targetType, targetId, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, userLabel, action, targetType, String(targetId || ''), details || null]
    );
  } catch (err) {
    console.error('Erreur audit log:', err.message);
  }
};

module.exports = { logAction };
