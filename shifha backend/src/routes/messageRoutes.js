const express = require('express');
const router = express.Router();
const {
  createConversation,
  getUserConversations,
  getConversationDetails,
  sendMessage,
  getConversationMessages,
  editMessage,
  searchDoctorsForMessaging
} = require('../controllers/messageController');
const { authenticateUser } = require('../middleware/auth.js');



router.post('/conversations', authenticateUser, createConversation);

router.get('/conversations/:organizationId', authenticateUser, getUserConversations);

router.get('/conversations/details/:conversationId', authenticateUser, getConversationDetails);



router.post('/conversations/:conversationId/messages', authenticateUser, sendMessage);

router.get('/conversations/:conversationId/messages', authenticateUser, getConversationMessages);

router.put('/messages/:messageId', authenticateUser, editMessage);



router.get('/doctors/:organizationId/search', authenticateUser, searchDoctorsForMessaging);

module.exports = router;