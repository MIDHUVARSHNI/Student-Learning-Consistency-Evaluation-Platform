const Activity = require('../models/Activity');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get activities
// @route   GET /api/activities
// @access  Private
const getActivities = asyncHandler(async (req, res) => {
    const activities = await Activity.find({ student: req.user.id }).sort({ date: -1 });
    res.status(200).json(activities);
});

// @desc    Set activity
// @route   POST /api/activities
// @access  Private
const createActivity = asyncHandler(async (req, res, next) => {
    const { subject, topic, duration, status, notes } = req.body;

    if (!subject || !duration) {
        return next(new AppError('Please add a subject and duration', 400));
    }

    const activity = await Activity.create({
        student: req.user.id,
        subject,
        topic,
        duration,
        status,
        notes,
    });

    res.status(200).json(activity);
});

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = asyncHandler(async (req, res, next) => {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
        return next(new AppError('Activity not found', 404));
    }

    // Check for user
    if (!req.user) {
        return next(new AppError('User not found', 401));
    }

    // Make sure the logged in user matches the activity user
    if (activity.student.toString() !== req.user.id) {
        return next(new AppError('User not authorized', 401));
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedActivity);
});

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = asyncHandler(async (req, res, next) => {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
        return next(new AppError('Activity not found', 404));
    }

    // Check for user
    if (!req.user) {
        return next(new AppError('User not found', 401));
    }

    // Make sure the logged in user matches the activity user
    if (activity.student.toString() !== req.user.id) {
        return next(new AppError('User not authorized', 401));
    }

    await activity.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity,
};
