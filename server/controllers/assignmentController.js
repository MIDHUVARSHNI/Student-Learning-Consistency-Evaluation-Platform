const asyncHandler = require('../utils/asyncHandler');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const AppError = require('../utils/appError');

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private/Educator
const createAssignment = asyncHandler(async (req, res, next) => {
    const { title, description, subject, dueDate, department, year } = req.body;

    if (!title || !description || !subject || !dueDate || !department || !year) {
        return next(new AppError('Please provide all required fields', 400));
    }

    const assignment = await Assignment.create({
        title,
        description,
        subject,
        dueDate,
        department,
        year,
        createdBy: req.user._id,
    });

    res.status(201).json(assignment);
});

// @desc    Get assignments (Filtered by role)
// @route   GET /api/assignments
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.role === 'student') {
        // Students see assignments for their department and year
        query = {
            department: req.user.department,
            year: req.user.year
        };
    } else if (req.user.role === 'educator') {
        // Educators see assignments they created
        query = { createdBy: req.user._id };
    }

    const assignments = await Assignment.find(query).sort({ createdAt: -1 });

    // For students, check if they have submitted
    if (req.user.role === 'student') {
        const submissions = await Submission.find({ student: req.user._id });
        const assignmentsWithStatus = assignments.map(assignment => {
            const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
            return {
                ...assignment._doc,
                status: submission ? submission.status : 'pending',
                submissionDetails: submission || null
            };
        });
        return res.status(200).json(assignmentsWithStatus);
    }

    res.status(200).json(assignments);
});

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
const submitAssignment = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    const assignmentId = req.params.id;

    if (!content) {
        return next(new AppError('Please provide submission content', 400));
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return next(new AppError('Assignment not found', 404));
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
        assignment: assignmentId,
        student: req.user._id
    });

    if (existingSubmission) {
        return next(new AppError('Assignment already submitted', 400));
    }

    const submission = await Submission.create({
        assignment: assignmentId,
        student: req.user._id,
        content
    });

    res.status(201).json(submission);
});

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private/Educator
const getAssignmentSubmissions = asyncHandler(async (req, res, next) => {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        return next(new AppError('Assignment not found', 404));
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to view these submissions', 403));
    }

    const submissions = await Submission.find({ assignment: req.params.id })
        .populate('student', 'name email collegeId');

    res.status(200).json(submissions);
});
// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Educator
const deleteAssignment = asyncHandler(async (req, res, next) => {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        return next(new AppError('Assignment not found', 404));
    }

    if (assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this assignment', 403));
    }

    // Delete associated submissions
    await Submission.deleteMany({ assignment: req.params.id });
    await assignment.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Evaluate submission
// @route   PUT /api/assignments/:id/evaluate
// @access  Private/Educator
const evaluateSubmission = asyncHandler(async (req, res, next) => {
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId).populate('assignment');
    if (!submission) {
        return next(new AppError('Submission not found', 404));
    }

    if (submission.assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to evaluate this submission', 403));
    }

    submission.status = 'evaluated';
    await submission.save();

    res.status(200).json(submission);
});

module.exports = {
    createAssignment,
    getAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    deleteAssignment,
    evaluateSubmission
};
