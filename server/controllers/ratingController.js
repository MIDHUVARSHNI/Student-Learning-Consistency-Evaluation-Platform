const StaffRating = require('../models/StaffRating');

// @desc    Submit a rating for a staff member
// @route   POST /api/ratings
// @access  Private/Student
const submitRating = async (req, res) => {
    try {
        const { staffId, rating, comment } = req.body;
        const studentId = req.user._id;

        const mongoose = require('mongoose');
        const staffObjectId = new mongoose.Types.ObjectId(staffId);
        const studentObjectId = new mongoose.Types.ObjectId(studentId);

        // Check if student already rated this staff member
        let existingRating = await StaffRating.findOne({ student: studentObjectId, staff: staffObjectId });

        if (existingRating) {
            existingRating.rating = rating;
            existingRating.comment = comment;
            await existingRating.save();
            return res.status(200).json(existingRating);
        }

        const newRating = await StaffRating.create({
            student: studentObjectId,
            staff: staffObjectId,
            rating,
            comment
        });

        res.status(201).json(newRating);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get average rating for a staff member
// @route   GET /api/ratings/staff/:id
// @access  Private
const getStaffRating = async (req, res) => {
    try {
        const staffId = req.params.id;
        const ratings = await StaffRating.find({ staff: staffId });

        const avgRating = ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) : 0;

        res.status(200).json({
            avgRating,
            count: ratings.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitRating,
    getStaffRating
};
