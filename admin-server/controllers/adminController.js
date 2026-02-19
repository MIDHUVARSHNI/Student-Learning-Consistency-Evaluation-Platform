const User = require('../models/User');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized as an admin' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all educators
// @route   GET /api/admin/educators
// @access  Private/Admin
const getEducators = async (req, res) => {
    try {
        const educators = await User.find({ role: 'educator' }).select('-password');
        res.json(educators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new user (student/educator)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
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
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific student analytics
// @route   GET /api/admin/students/:id/analytics
// @access  Private/Admin
const getStudentAnalytics = async (req, res) => {
    try {
        const studentId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid Student ID' });
        }

        const activities = await Activity.find({ student: studentId });
        const studentUser = await User.findById(studentId);

        if (!studentUser) {
            return res.status(404).json({ message: 'Student not found' });
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
                    return activityDate && new Date(activityDate).toISOString().split('T')[0] === dateString;
                })
                .reduce((acc, curr) => acc + curr.duration, 0);

            last7Days.push({
                name: dayName,
                minutes: dailyDuration
            });
        }

        // Calculate Consistency Score
        const activeDays = last7Days.filter(day => day.minutes > 0).length;
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

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEducatorAnalytics = async (req, res) => {
    try {
        const educatorId = req.params.id;
        const Feedback = require('../models/Feedback');

        const educator = await User.findById(educatorId);
        if (!educator || educator.role !== 'educator') {
            return res.status(404).json({ message: 'Educator not found' });
        }

        // 1. Total Feedback Given
        const feedbackGiven = await Feedback.countDocuments({ educator: educatorId });

        // 2. Recent Feedback Activity (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentFeedback = await Feedback.find({
            educator: educatorId,
            createdAt: { $gte: sevenDaysAgo }
        });

        // 3. Students Interacted With (Unique students who received feedback)
        const uniqueStudents = await Feedback.find({ educator: educatorId }).distinct('student');

        // 4. Activity Distribution (Mock data if no real tracking exists)
        // Since we don't track "Login" explicitly in a separate table, we can show feedback distribution over the week.
        const feedbackByDay = await Feedback.aggregate([
            { $match: { educator: new mongoose.Types.ObjectId(educatorId), createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = days.map((day, index) => {
            // MongoDB dayOfWeek: 1 (Sun) - 7 (Sat)
            // Array index: 0 (Sun) - 6 (Sat)
            const dayData = feedbackByDay.find(d => d._id === index + 1);
            return {
                name: day,
                minutes: dayData ? dayData.count : 0 // Reusing 'minutes' key for chart compatibility
            };
        });

        // 5. Mock Consistency Score (Based on regular feedback)
        // Simple logic: if they gave feedback in > 3 of last 7 days = High Consistency
        const activeDaysCount = feedbackByDay.length;
        let consistencyScore = Math.min(100, (activeDaysCount / 5) * 100); // Target 5 days a week

        res.status(200).json({
            totalHours: feedbackGiven, // Labelled as "Total Feedback" in UI
            consistencyScore: Math.round(consistencyScore),
            subjectData: [
                { name: 'Feedback Given', value: feedbackGiven },
                { name: 'Students Mentored', value: uniqueStudents.length }
            ],
            weeklyData,
            totalActivities: feedbackGiven,
            weeklyGoal: 10, // Target feedback count
            currentWeekHours: recentFeedback.length
        });

    } catch (error) {
        console.error('Error fetching educator analytics:', error);
        res.status(500).json({ message: error.message });
    }
};

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
