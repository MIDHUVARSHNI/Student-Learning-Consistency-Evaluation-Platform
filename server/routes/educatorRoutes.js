const express = require('express');
const router = express.Router();
const { getStudentStats, getStudentAnalytics, getEducators } = require('../controllers/educatorController');
const { protect, educator } = require('../middleware/authMiddleware');

router.get('/students', protect, educator, getStudentStats);
router.get('/student/:id/analytics', protect, educator, getStudentAnalytics);
router.get('/list', protect, getEducators);

module.exports = router;
