const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    subject: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
    },
    duration: {
        type: Number, // duration in minutes
        required: true,
    },
    status: {
        type: String,
        enum: ['completed', 'in-progress', 'skipped'],
        default: 'completed',
    },
    notes: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
