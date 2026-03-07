const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Please provide submission content or link'],
        },
        status: {
            type: String,
            enum: ['submitted', 'evaluated'],
            default: 'submitted',
        },
        grade: {
            type: String,
        },
        feedback: {
            type: String,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Submission', submissionSchema);
