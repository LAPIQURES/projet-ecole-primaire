const express = require('express');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.use(verifyToken);

router.get('/contacts', messageController.getContacts);
router.get('/', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.get('/unread-count', messageController.getUnreadCount);
router.patch('/read', messageController.markConversationRead);

// Groups
router.get('/groups', messageController.getGroups);
router.post('/groups', messageController.createGroup);
router.get('/groups/:id/messages', messageController.getGroupMessages);
router.post('/groups/:id/messages', messageController.sendGroupMessage);

module.exports = router;