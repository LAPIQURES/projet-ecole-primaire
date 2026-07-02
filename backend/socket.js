let io = null;
const jwt = require('jsonwebtoken');
const config = require('./config');
const pool = require('./database/db');

module.exports = {
  init(server) {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: '*'
      }
    });

    io.on('connection', (socket) => {
      // Try to authenticate from handshake auth (token)
      try {
        const token = socket.handshake?.auth?.token || socket.handshake?.query?.token;
        if (token) {
          const decoded = jwt.verify(token, config.jwt.secret);
          socket.user = decoded;
          const identifier = String(decoded.username || decoded.id || decoded.sub || decoded.email || 'unknown');
          socket.join(`user-${identifier}`);
        }
      } catch (err) {
        // If token invalid, don't kill the connection but keep it unauthenticated
      }

      console.log('Socket connected', socket.id);

      socket.on('identify', (payload) => {
        if (payload && payload.identifier) {
          socket.join(`user-${payload.identifier}`);
        }
      });

      socket.on('join:group', (groupId) => {
        if (groupId) socket.join(`group-${groupId}`);
      });

      socket.on('leave:group', (groupId) => {
        if (groupId) socket.leave(`group-${groupId}`);
      });

      socket.on('disconnect', () => {
        // noop
      });

      // Join a conversation room
      socket.on('join_conversation', (idConv) => {
        if (!idConv) return;
        socket.join(`conv-${idConv}`);
      });

      // Send a message in a conversation
      socket.on('send_message', async (payload) => {
        try {
          const { idConv, content } = payload || {};
          if (!idConv || !content || !content.trim()) return;
          const senderId = String(socket.user?.username || socket.user?.id || 'anon');
          const senderNom = socket.user?.nom || socket.user?.name || senderId;

          const [result] = await pool.query(
            'INSERT INTO ChatMessage (idConv, senderId, senderNom, content, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [idConv, senderId, senderNom, content.trim(), 'sent']
          );
          const [rows] = await pool.query('SELECT * FROM ChatMessage WHERE id = ?', [result.insertId]);
          const msg = rows[0];
          // Emit to conversation room
          io.to(`conv-${idConv}`).emit('receive_message', msg);
        } catch (err) {
          console.error('socket send_message error:', err.message);
        }
      });

      // Mark messages as read in a conversation
      socket.on('mark_read', async (payload) => {
        try {
          const { idConv, messageIds } = payload || {};
          if (!idConv) return;
          if (Array.isArray(messageIds) && messageIds.length) {
            await pool.query('UPDATE ChatMessage SET status = ? WHERE id IN (?)', ['read', messageIds]);
            io.to(`conv-${idConv}`).emit('message_read', { idConv, messageIds });
          }
        } catch (err) { console.error('socket mark_read error:', err.message); }
      });
    });

    return io;
  },
  get() {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
  }
};
