const Feedback = require('../models/Feedback');
const User = require('../models/User');

// @desc    Send feedback to a student
// @route   POST /api/feedback
// @access  Private/Educator
const sendFeedback = async (req, res) => {
    const { studentId, message } = req.body;

    try {
        if (!studentId || !message) {
            res.status(400);
            throw new Error('Please provide student ID and message');
        }

        const feedback = await Feedback.create({
            student: studentId,
            educator: req.user.id,
            message,
        });

        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get feedback for the logged-in student
// @route   GET /api/feedback
// @access  Private/Student
const getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ student: req.user.id })
            .populate('educator', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendFeedback,
    getFeedback,
};
