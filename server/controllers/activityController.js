const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Get activities
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ student: req.user.id }).sort({ date: -1 });
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set activity
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res) => {
    const { subject, topic, duration, status, notes } = req.body;

    if (!subject || !duration) {
        return res.status(400).json({ message: 'Please add a subject and duration' });
    }

    try {
        const activity = await Activity.create({
            student: req.user.id,
            subject,
            topic,
            duration,
            status,
            notes,
        });

        res.status(200).json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the activity user
        if (activity.student.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedActivity = await Activity.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedActivity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the activity user
        if (activity.student.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await activity.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity,
};
