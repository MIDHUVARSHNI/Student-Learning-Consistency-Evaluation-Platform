const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    minutes: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

// Ensure unique entry per user per day
userActivitySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('UserActivity', userActivitySchema);
