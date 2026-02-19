const express = require('express');
const router = express.Router();
const { getMyMessages, markMessageRead, getUnreadCount, getUnreadCountsBySender, getAdmins, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyMessages);
router.post('/', protect, sendMessage);
router.get('/unread-count', protect, getUnreadCount);
router.get('/unread-counts-by-sender', protect, getUnreadCountsBySender);
router.get('/admins', protect, getAdmins);
router.put('/:id/read', protect, markMessageRead);

module.exports = router;
