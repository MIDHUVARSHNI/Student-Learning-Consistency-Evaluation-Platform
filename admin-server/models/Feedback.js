const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        educator: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        message: {
            type: String,
            required: [true, 'Please add a message'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
