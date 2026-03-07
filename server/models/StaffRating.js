const mongoose = require('mongoose');

const staffRatingSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        rating: {
            type: Number,
            required: [true, 'Please add a rating between 1 and 5'],
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('StaffRating', staffRatingSchema);
