const express = require('express');
const router = express.Router();
const { submitRating, getStaffRating } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitRating);
router.get('/staff/:id', protect, getStaffRating);

module.exports = router;
