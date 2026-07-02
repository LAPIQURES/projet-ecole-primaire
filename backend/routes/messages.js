const express = require('express');
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.use(auth);

router.get('/contacts', messageController.getContacts);
router.get('/', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.patch('/read', messageController.markConversationRead);

// Groups
router.get('/groups', messageController.getGroups);
router.post('/groups', messageController.createGroup);
router.get('/groups/:id/messages', messageController.getGroupMessages);
router.post('/groups/:id/messages', messageController.sendGroupMessage);

module.exports = router;