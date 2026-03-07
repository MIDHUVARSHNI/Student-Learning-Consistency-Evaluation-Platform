const express = require('express');
const router = express.Router();
const { getAnalytics, getStaffConsistency } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAnalytics);
router.get('/staff-consistency', protect, getStaffConsistency);

module.exports = router;
