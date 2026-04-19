const User = require('../models/User');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.role !== 'admin') {
            return next(new AppError('Not authorized as an admin', 401));
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        return next(new AppError('Invalid email or password', 401));
    }
});

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
});

// @desc    Get all educators
// @route   GET /api/admin/educators
// @access  Private/Admin
const getEducators = asyncHandler(async (req, res) => {
    const UserActivity = require('../models/UserActivity');
    const educators = await User.find({ role: 'educator' }).select('-password');

    const educatorsWithStats = await Promise.all(educators.map(async (edu) => {
        const last7Days = [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setHours(0, 0, 0, 0);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const activities = await UserActivity.find({
            user: edu._id,
            date: { $gte: sevenDaysAgo }
        });

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const activity = activities.find(a => a.date.getTime() === d.getTime());
            last7Days.push(activity ? activity.minutes : 0);
        }

        const activeDays = last7Days.filter(m => m > 0).length;
        const consistencyScore = Math.round((activeDays / 7) * 100);

        return {
            ...edu._doc,
            consistencyScore
        };
    }));

    res.json(educatorsWithStats);
});

// @desc    Create a new user (student/educator)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, department, year, collegeId, rollNo } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('User already exists', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        department: department || '',
        year: year || '',
        collegeId: collegeId || undefined,
        rollNo: rollNo || '',
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            rollNo: user.rollNo,
        });
    } else {
        return next(new AppError('Invalid user data', 400));
    }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        if (req.body.department !== undefined) {
            user.department = req.body.department;
        }
        if (req.body.year !== undefined) {
            user.year = req.body.year;
        }
        if (req.body.collegeId !== undefined) {
            user.collegeId = req.body.collegeId;
        }
        if (req.body.rollNo !== undefined) {
            user.rollNo = req.body.rollNo;
        }
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        return next(new AppError('User not found', 404));
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        return next(new AppError('User not found', 404));
    }
});

// @desc    Get specific student analytics
// @route   GET /api/admin/students/:id/analytics
// @access  Private/Admin
const getStudentAnalytics = asyncHandler(async (req, res, next) => {
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return next(new AppError('Invalid Student ID', 400));
    }

    const activities = await Activity.find({ student: studentId, status: 'completed' });
    const Submission = require('../models/Submission');
    const submissions = await Submission.find({ student: studentId, status: 'evaluated' });
    const studentUser = await User.findById(studentId);

    if (!studentUser) {
        return next(new AppError('Student not found', 404));
    }

    // Calculate Total Study Hours
    const totalMinutes = activities.reduce((acc, curr) => acc + curr.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Calculate Subject Distribution
    const subjectStats = activities.reduce((acc, curr) => {
        acc[curr.subject] = (acc[curr.subject] || 0) + curr.duration;
        return acc;
    }, {});

    const subjectData = Object.keys(subjectStats).map(subject => ({
        name: subject,
        value: subjectStats[subject]
    }));

    // Calculate Weekly Activity (Last 7 Days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];

        // Find total duration for this day
        const dailyDuration = activities
            .filter(a => {
                const activityDate = a.date || a.createdAt;
                return activityDate && new Date(activityDate).toISOString().split('T')[0] === dateString && a.status === 'completed';
            })
            .reduce((acc, curr) => acc + curr.duration, 0);

        const hasSubmission = submissions.some(s => s.createdAt && s.createdAt.toISOString().split('T')[0] === dateString);

        last7Days.push({
            name: dayName,
            minutes: dailyDuration,
            hasSubmission
        });
    }

    // Calculate Consistency Score
    const activeDays = last7Days.filter(day => day.minutes > 0 || day.hasSubmission).length;
    const consistencyScore = Math.round((activeDays / 7) * 100);

    // Goal Progress
    const weeklyGoal = studentUser.weeklyGoal || 10;
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentWeekDuration = activities
        .filter(a => {
            const activityDate = a.date || a.createdAt;
            return activityDate && new Date(activityDate) >= currentWeekStart;
        })
        .reduce((acc, curr) => acc + curr.duration, 0);

    const currentWeekHours = (currentWeekDuration / 60).toFixed(1);

    res.status(200).json({
        totalHours,
        consistencyScore,
        subjectData,
        weeklyData: last7Days,
        totalActivities: activities.length,
        weeklyGoal,
        currentWeekHours,
    });
});

const getEducatorAnalytics = asyncHandler(async (req, res, next) => {
    const educatorId = req.params.id;
    const Feedback = require('../models/Feedback');
    const UserActivity = require('../models/UserActivity');

    const educator = await User.findById(educatorId);
    if (!educator || educator.role !== 'educator') {
        return next(new AppError('Educator not found', 404));
    }

    // 1. Total Feedback Given
    const feedbackGiven = await Feedback.countDocuments({ educator: educatorId });

    // 2. Recent Usage Activity (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const activities = await UserActivity.find({
        user: educatorId,
        date: { $gte: sevenDaysAgo }
    });

    // 3. Students Interacted With (Unique students who received feedback)
    const uniqueStudents = await Feedback.find({ educator: educatorId }).distinct('student');

    // 4. Activity Distribution (Minutes per day)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    let totalMinutesThisWeek = 0;

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dayName = days[d.getDay()];

        const activity = activities.find(a => a.date.getTime() === d.getTime());
        const mins = activity ? activity.minutes : 0;
        totalMinutesThisWeek += mins;

        weeklyData.push({
            name: dayName,
            minutes: mins
        });
    }

    // 5. Consistency Score (Active days in last 7 based on dashboard usage)
    const activeDaysCount = weeklyData.filter(d => d.minutes > 0).length;
    const consistencyScore = Math.round((activeDaysCount / 7) * 100);

    const StaffRating = require('../models/StaffRating');

    // 6. Student Ratings Summary
    const ratings = await StaffRating.find({ staff: educatorId });
    const avgRating = ratings.length > 0
        ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
        : 0;

    // 7. Active Today status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await UserActivity.findOne({
        user: educatorId,
        date: today,
        minutes: { $gt: 0 }
    });

    res.status(200).json({
        totalHours: feedbackGiven,
        consistencyScore,
        avgRating: Number(avgRating),
        totalRatings: ratings.length,
        isActiveToday: !!activeToday,
        subjectData: [
            { name: '5 Stars', value: ratings.filter(r => r.rating === 5).length },
            { name: '4 Stars', value: ratings.filter(r => r.rating === 4).length },
            { name: '3 Stars', value: ratings.filter(r => r.rating === 3).length },
            { name: '2 Stars', value: ratings.filter(r => r.rating === 2).length },
            { name: '1 Star', value: ratings.filter(r => r.rating === 1).length },
        ],
        weeklyData,
        totalActivities: totalMinutesThisWeek,
        currentWeekHours: (totalMinutesThisWeek / 60).toFixed(1)
    });
});

module.exports = {
    adminLogin,
    getStudents,
    getEducators,
    createUser,
    updateUser,
    deleteUser,
    getStudentAnalytics,
    getEducatorAnalytics,
};
