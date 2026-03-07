const mongoose = require('mongoose');

const assignmentSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        subject: {
            type: String,
            required: [true, 'Please add a subject'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Please add a due date'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        year: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
