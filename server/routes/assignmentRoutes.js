const express = require('express');
const router = express.Router();
const {
    createAssignment,
    getAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    deleteAssignment
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('educator', 'admin'), createAssignment)
    .get(getAssignments);

router.route('/:id')
    .delete(authorize('educator', 'admin'), deleteAssignment);

router.route('/:id/submit')
    .post(authorize('student'), submitAssignment);

router.route('/:id/submissions')
    .get(authorize('educator', 'admin'), getAssignmentSubmissions);

module.exports = router;
