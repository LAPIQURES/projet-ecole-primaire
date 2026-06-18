const express = require('express');
const router = express.Router();
const socketHelper = require('../socket');

// Dev-only emitter to simulate events without touching DB
router.post('/emit', (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' });
  try {
    const { event, room, payload } = req.body || {};
    const io = socketHelper.get();
    if (!event) return res.status(400).json({ error: 'event required' });
    if (room) io.to(room).emit(event, payload || {});
    else io.emit(event, payload || {});
    return res.json({ ok: true, event, room });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
