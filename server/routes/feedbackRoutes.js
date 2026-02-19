const express = require('express');
const router = express.Router();
const { sendFeedback, getFeedback } = require('../controllers/feedbackController');
const { protect, educator } = require('../middleware/authMiddleware');

router.post('/', protect, educator, sendFeedback);
router.get('/', protect, getFeedback);

module.exports = router;
