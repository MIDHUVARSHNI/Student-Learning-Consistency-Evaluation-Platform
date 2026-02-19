const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesForUser, getUnreadCount, getUnreadCountsBySender, markMessageRead } = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, sendMessage);
router.get('/unread-count', protect, admin, getUnreadCount);
router.get('/unread-by-sender', protect, admin, getUnreadCountsBySender);
router.get('/:userId', protect, admin, getMessagesForUser);
router.put('/:id/read', protect, admin, markMessageRead);

module.exports = router;
