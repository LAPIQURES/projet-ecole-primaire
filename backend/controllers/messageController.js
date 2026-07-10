const pool = require('../database/db');
const socketHelper = require('../socket');
const { getTableColumns, selectColumns } = require('../utils/schema');

const normalizeRole = (role) => {
  if (role === 'superadmin' || role === 'admin') return 'admin';
  if (role === 'enseignant' || role === 'parent') return role;
  return role || 'admin';
};

const getUserKey = (user) => String(user?.login || user?.username || user?.id || '');

const getCurrentUserLabel = async (user) => {
  const role = normalizeRole(user?.role);
  const identifier = getUserKey(user);

  try {
    if (role === 'admin') {
      const [rows] = await pool.query('SELECT nom, username, login FROM Admin WHERE username = ? OR login = ? LIMIT 1', [identifier, identifier]);
      if (rows.length) return rows[0].nom || rows[0].username || rows[0].login || identifier;
    }

    if (role === 'enseignant') {
      const [rows] = await pool.query(
        `SELECT p.nom, p.prenom, p.username, p.login
         FROM Enseignant en
         JOIN Personne p ON p.idPers = en.idPers
         WHERE p.username = ? OR p.login = ? LIMIT 1`,
        [identifier, identifier]
      );
      if (rows.length) return `${rows[0].prenom || ''} ${rows[0].nom || ''}`.trim() || rows[0].username || rows[0].login || identifier;
    }

    if (role === 'parent') {
      const personneCols = await getTableColumns('Personne');
      const parentSelect = selectColumns('p', personneCols, ['nom', 'prenom', 'username', 'login']);
      const [rows] = await pool.query(
        `SELECT ${parentSelect}
         FROM Parents pr
         JOIN Personne p ON p.idPers = pr.idPers
         WHERE p.username = ? OR p.login = ? LIMIT 1`,
        [identifier, identifier]
      );
      if (rows.length) return `${rows[0].prenom || ''} ${rows[0].nom || ''}`.trim() || rows[0].username || rows[0].login || identifier;
    }
  } catch (error) {
    console.error('Erreur getCurrentUserLabel:', error.message);
  }

  return identifier || 'Utilisateur';
};

const ensureMessagesSchema = async () => {
  const [columns] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Messages'`
  );
  const columnSet = new Set(columns.map((column) => column.COLUMN_NAME));
  const statements = [];

  const addColumn = (name, definition) => {
    if (!columnSet.has(name)) {
      statements.push(`ALTER TABLE Messages ADD COLUMN ${definition}`);
      columnSet.add(name);
    }
  };

  addColumn('senderRole', 'senderRole VARCHAR(30) NULL AFTER idExp_Pers');
  addColumn('senderId', 'senderId VARCHAR(120) NULL AFTER senderRole');
  addColumn('senderLabel', 'senderLabel VARCHAR(160) NULL AFTER senderId');
  addColumn('receiverRole', 'receiverRole VARCHAR(30) NULL AFTER senderLabel');
  addColumn('receiverId', 'receiverId VARCHAR(120) NULL AFTER receiverRole');
  addColumn('receiverLabel', 'receiverLabel VARCHAR(160) NULL AFTER receiverId');
  addColumn('subject', 'subject VARCHAR(255) NOT NULL DEFAULT "" AFTER objet');
  addColumn('content', 'content TEXT NULL AFTER subject');
  addColumn('isRead', 'isRead TINYINT(1) NOT NULL DEFAULT 0 AFTER valider');
  addColumn('readAt', 'readAt DATETIME NULL AFTER isRead');
  addColumn('updated_at', 'updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER readAt');

  // Make legacy columns nullable
  statements.push('ALTER TABLE Messages MODIFY idParent INT UNSIGNED NULL');
  statements.push('ALTER TABLE Messages MODIFY idExp_Pers INT UNSIGNED NULL');

  for (const statement of statements) {
    await pool.query(statement);
  }
};

ensureMessagesSchema().catch((error) => {
  console.error('Erreur alignement table Messages:', error.message);
});

// Groups schema
const ensureGroupsSchema = async () => {
  const [tables] = await pool.query(`SHOW TABLES LIKE 'MessageGroups'`);
  if (!tables.length) {
    await pool.query(`
      CREATE TABLE MessageGroups (
        idGroup INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        description TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  const [gmsgs] = await pool.query(`SHOW TABLES LIKE 'GroupMessages'`);
  if (!gmsgs.length) {
    await pool.query(`
      CREATE TABLE GroupMessages (
        idMsg INT AUTO_INCREMENT PRIMARY KEY,
        groupId INT NOT NULL,
        senderRole VARCHAR(30) NULL,
        senderId VARCHAR(120) NULL,
        senderLabel VARCHAR(160) NULL,
        content TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (groupId) REFERENCES MessageGroups(idGroup) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }
};

ensureGroupsSchema().catch((err) => console.error('Erreur schema groups:', err.message));

// Conversations & chat schema (new tables required)
const ensureChatSchema = async () => {
  const [convTables] = await pool.query(`SHOW TABLES LIKE 'Conversation'`);
  if (!convTables.length) {
    await pool.query(`
      CREATE TABLE Conversation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('direct','group') NOT NULL,
        nom VARCHAR(255) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  const [parts] = await pool.query(`SHOW TABLES LIKE 'ConvParticipant'`);
  if (!parts.length) {
    await pool.query(`
      CREATE TABLE ConvParticipant (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idConv INT NOT NULL,
        userId VARCHAR(100) NOT NULL,
        userType VARCHAR(50) NOT NULL,
        FOREIGN KEY (idConv) REFERENCES Conversation(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  const [msgs] = await pool.query(`SHOW TABLES LIKE 'ChatMessage'`);
  if (!msgs.length) {
    await pool.query(`
      CREATE TABLE ChatMessage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idConv INT NOT NULL,
        senderId VARCHAR(100) NULL,
        senderNom VARCHAR(255) NULL,
        content TEXT NULL,
        status ENUM('sent','delivered','read') DEFAULT 'sent',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idConv) REFERENCES Conversation(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }
};

ensureChatSchema().catch((err) => console.error('Erreur schema chat:', err.message));

// Groups endpoints
exports.getGroups = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT idGroup AS id, name, description, created_at FROM MessageGroups ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const [result] = await pool.query('INSERT INTO MessageGroups (name, description, created_at) VALUES (?, ?, NOW())', [name, description || '']);
    const [rows] = await pool.query('SELECT idGroup AS id, name, description, created_at FROM MessageGroups WHERE idGroup = ?', [result.insertId]);
    // notify via socket
    try {
      // insert a welcome message in the group
      const welcome = 'Bonjour et bienvenue dans ce groupe. Utilisez cet espace pour partager les informations importantes liées aux activités de l\'école.';
      const [mres] = await pool.query('INSERT INTO GroupMessages (groupId, senderRole, senderId, senderLabel, content, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [result.insertId, 'system', 'system', 'Système', welcome]);
      const [msgRows] = await pool.query('SELECT idMsg AS id, groupId, senderRole, senderId, senderLabel, content, created_at FROM GroupMessages WHERE idMsg = ?', [mres.insertId]);
      const io = socketHelper.get();
      io.emit('group:created', rows[0]);
      // emit the welcome message to the group room
      io.to(`group-${result.insertId}`).emit('group:message:new', msgRows[0]);
    } catch (e) {
      // socket not ready or db insert failed; continue
      try { const io = socketHelper.get(); io.emit('group:created', rows[0]); } catch (err) {}
    }
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT idMsg AS id, groupId, senderRole, senderId, senderLabel, content, created_at FROM GroupMessages WHERE groupId = ? ORDER BY created_at ASC LIMIT 1000', [id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.sendGroupMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });
    const senderRole = normalizeRole(req.user?.role);
    const senderId = getUserKey(req.user);
    const senderLabel = await getCurrentUserLabel(req.user);
    const [result] = await pool.query('INSERT INTO GroupMessages (groupId, senderRole, senderId, senderLabel, content, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [id, senderRole, String(senderId), senderLabel, content.trim()]);
    const [rows] = await pool.query('SELECT idMsg AS id, groupId, senderRole, senderId, senderLabel, content, created_at FROM GroupMessages WHERE idMsg = ?', [result.insertId]);
    // emit to group via socket
    try {
      const io = socketHelper.get();
      io.to(`group-${id}`).emit('group:message:new', rows[0]);
    } catch (e) {
      // ignore if socket unavailable
    }
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getContacts = async (req, res) => {
  try {
    const currentIdentifier = getUserKey(req.user);
    const personneCols = await getTableColumns('Personne');
    const parentIdentifierExpr = personneCols.has('username')
      ? 'COALESCE(NULLIF(p.username, \'\'), CONCAT(\'parent-\', pr.idParent)) AS identifier'
      : 'CONCAT(\'parent-\', pr.idParent) AS identifier';
    const parentWhereExpr = personneCols.has('username')
      ? 'COALESCE(p.username, \'\') <> \'\' AND p.username <> ?'
      : '1=1';

    const [admins, enseignants, parents] = await Promise.all([
      pool.query(
        `SELECT
          username AS identifier,
          CASE WHEN COALESCE(nom, '') = '' THEN username ELSE nom END AS label,
          CASE typeAdmin WHEN 1 THEN 'superadmin' WHEN 2 THEN 'admin' WHEN 5 THEN 'directeur' WHEN 6 THEN 'intendant' ELSE 'admin' END AS role,
          CONCAT(
            CASE WHEN COALESCE(nom, '') = '' THEN username ELSE nom END,
            ' · ',
            CASE typeAdmin WHEN 1 THEN 'SuperAdmin' WHEN 2 THEN 'Admin' WHEN 5 THEN 'Directeur' WHEN 6 THEN 'Intendant' ELSE 'Staff' END
          ) AS displayLabel
         FROM Admin
         WHERE actif = 1 AND username IS NOT NULL AND username <> '' AND username <> ?
         ORDER BY nom`,
        [currentIdentifier]
      ),
      pool.query(
        `SELECT
          COALESCE(p.username, p.login) AS identifier,
          TRIM(CONCAT(COALESCE(p.prenom, ''), ' ', COALESCE(p.nom, ''))) AS label,
          'enseignant' AS role,
          CONCAT(TRIM(CONCAT(COALESCE(p.prenom, ''), ' ', COALESCE(p.nom, ''))), ' · Enseignant') AS displayLabel
         FROM Enseignant en
         JOIN Personne p ON p.idPers = en.idPers
         WHERE en.Actif = 1 AND COALESCE(p.username, p.login, '') <> '' AND COALESCE(p.username, p.login) <> ?
         ORDER BY p.prenom, p.nom`,
        [currentIdentifier]
      ),
      pool.query(
        `SELECT
          COALESCE(NULLIF(p.username, ''), NULLIF(p.login, ''), CONCAT('parent-', pr.idParent)) AS identifier,
          TRIM(CONCAT(COALESCE(p.prenom, ''), ' ', COALESCE(p.nom, ''))) AS label,
          'parent' AS role,
          CONCAT(TRIM(CONCAT(COALESCE(p.prenom, ''), ' ', COALESCE(p.nom, ''))), ' · Parent') AS displayLabel,
          e.matricule AS eleveMatricule
         FROM Parents pr
         JOIN Personne p ON p.idPers = pr.idPers
         LEFT JOIN Eleve e ON e.matricule = pr.matricule
         WHERE 1=1
         ORDER BY p.prenom, p.nom`,
        []
      )
    ]);

    const contacts = [
      ...admins[0].map((row) => ({ ...row, id: row.identifier })),
      ...enseignants[0].map((row) => ({ ...row, id: row.identifier })),
      ...parents[0].map((row) => ({ ...row, id: row.identifier }))
    ];

    res.json(contacts);
  } catch (error) {
    console.error('Erreur getContacts:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    const identifier = getUserKey(req.user);

    const [rows] = await pool.query(
      `SELECT
        idMessages AS idMessage,
        COALESCE(senderRole, 'admin') AS senderRole,
        COALESCE(senderId, '') AS senderId,
        COALESCE(senderLabel, '') AS senderLabel,
        COALESCE(receiverRole, 'parent') AS receiverRole,
        COALESCE(receiverId, '') AS receiverId,
        COALESCE(receiverLabel, '') AS receiverLabel,
        COALESCE(subject, objet, '') AS subject,
        COALESCE(content, information, '') AS content,
        COALESCE(isRead, valider, 0) AS isRead,
        readAt,
        created_at
       FROM Messages
       WHERE (COALESCE(senderRole, 'admin') = ? AND COALESCE(senderId, '') = ?)
          OR (COALESCE(receiverRole, 'admin') = ? AND COALESCE(receiverId, '') = ?)
       ORDER BY created_at DESC
       LIMIT 500`,
      [role, identifier, role, identifier]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erreur getMessages:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverRole, receiverId, receiverLabel, subject = '', content = '' } = req.body;
    if (!receiverRole || !receiverId || !content.trim()) {
      return res.status(400).json({ error: 'Destinataire et contenu requis' });
    }

    const senderRole = normalizeRole(req.user?.role);
    const senderId = getUserKey(req.user);
    const senderLabel = await getCurrentUserLabel(req.user);
    const [annees] = await pool.query('SELECT idAnnee FROM AnneeAcademique ORDER BY created_at DESC LIMIT 1');
    const anneeAcade = annees.length > 0 ? annees[0].idAnnee : 1;

    const [result] = await pool.query(
      `INSERT INTO Messages
        (idExp_Pers, idParent, objet, information, type_message, AnneeAcade, created_at, valider, senderRole, senderId, senderLabel, receiverRole, receiverId, receiverLabel, subject, content, isRead, readAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        senderRole === 'admin' || senderRole === 'enseignant' ? Number(req.user?.id || 0) || null : null,
        normalizeRole(receiverRole) === 'parent' ? Number(String(receiverId).replace(/\D/g, '')) || null : null,
        subject.trim(),
        content.trim(),
        1,
        anneeAcade,
        0,
        senderRole,
        senderId,
        senderLabel,
        normalizeRole(receiverRole),
        String(receiverId),
        receiverLabel || String(receiverId),
        subject.trim(),
        content.trim(),
        0,
        null
      ]
    );

    const [rows] = await pool.query(
      `SELECT
        idMessages AS idMessage,
        COALESCE(senderRole, 'admin') AS senderRole,
        COALESCE(senderId, '') AS senderId,
        COALESCE(senderLabel, '') AS senderLabel,
        COALESCE(receiverRole, 'parent') AS receiverRole,
        COALESCE(receiverId, '') AS receiverId,
        COALESCE(receiverLabel, '') AS receiverLabel,
        COALESCE(subject, objet, '') AS subject,
        COALESCE(content, information, '') AS content,
        COALESCE(isRead, valider, 0) AS isRead,
        readAt,
        created_at
       FROM Messages
       WHERE idMessages = ?
       LIMIT 1`,
      [result.insertId]
    );
    // notify receiver via socket if possible
    try {
      const io = socketHelper.get();
      const payload = rows[0];
      // emit both to receiver personal room and to sender (so sender UI updates too)
      if (payload && payload.receiverId) io.to(`user-${String(payload.receiverId)}`).emit('message:new', payload);
      if (payload && payload.senderId) io.to(`user-${String(payload.senderId)}`).emit('message:new', payload);
    } catch (e) {
      // socket may not be initialized
    }
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erreur sendMessage:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.markConversationRead = async (req, res) => {
  try {
    const { peerRole, peerId, role, identifier, messageIds } = req.body;
    
    // Approach 1: Mark specific message IDs as read
    if (Array.isArray(messageIds) && messageIds.length > 0) {
      await pool.query(
        `UPDATE Messages SET isRead = 1, readAt = NOW() WHERE idMessages IN (?) AND isRead = 0`,
        [messageIds]
      );
      return res.json({ message: 'Messages marqués comme lus' });
    }
    
    // Approach 2: Mark by peer role/id
    const actualPeerRole = peerRole || role;
    const actualPeerId = peerId || identifier;
    
    if (!actualPeerRole || !actualPeerId) {
      return res.status(400).json({ error: 'Conversation à marquer requise' });
    }

    const myRole = normalizeRole(req.user?.role);
    const myIdentifier = getUserKey(req.user);

    await pool.query(
      `UPDATE Messages
       SET isRead = 1, readAt = NOW()
       WHERE receiverRole = ? AND receiverId = ? AND senderRole = ? AND senderId = ? AND isRead = 0`,
      [myRole, myIdentifier, normalizeRole(actualPeerRole), String(actualPeerId)]
    );

    res.json({ message: 'Conversation marquée comme lue' });
  } catch (error) {
    console.error('Erreur markConversationRead:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    const identifier = getUserKey(req.user);
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM Messages WHERE receiverRole = ? AND receiverId = ? AND isRead = 0', [role, identifier]);
    res.json({ unread: rows[0].count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};