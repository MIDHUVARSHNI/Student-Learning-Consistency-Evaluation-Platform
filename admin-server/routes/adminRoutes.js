const express = require('express');
const router = express.Router();
const {
    adminLogin,
    getStudents,
    getEducators,
    createUser,
    updateUser,
    deleteUser,
    getStudentAnalytics,
    getEducatorAnalytics,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', adminLogin);
router.get('/students', protect, admin, getStudents);
router.get('/students/:id/analytics', protect, admin, getStudentAnalytics);
router.get('/educators/:id/analytics', protect, admin, getEducatorAnalytics);
router.get('/educators', protect, admin, getEducators);
router.post('/users', protect, admin, createUser);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
