const mongoose = require('mongoose');

const consistencySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    weekStartDate: {
        type: Date,
        required: true,
    },
    totalStudyHours: {
        type: Number,
        default: 0,
    },
    consistencyScore: {
        type: Number, // 0-100 or customized metric
        default: 0,
    },
    daysActive: {
        type: Number,
        default: 0,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Consistency', consistencySchema);
