const User = require('../models/User');
const Activity = require('../models/Activity');
const mongoose = require('mongoose');

// @desc    Get all students with their stats
// @route   GET /api/educator/students
// @access  Private/Educator
const getStudentStats = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');

        const studentStats = await Promise.all(students.map(async (student) => {
            const activities = await Activity.find({ student: student._id });

            // Calculate Consistency Score (Same logic as analyticsController)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const last7Days = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateString = d.toISOString().split('T')[0];

                const dailyDuration = activities
                    .filter(a => a.createdAt.toISOString().split('T')[0] === dateString)
                    .reduce((acc, curr) => acc + curr.duration, 0);

                last7Days.push({ minutes: dailyDuration });
            }

            const activeDays = last7Days.filter(day => day.minutes > 0).length;
            const consistencyScore = Math.round((activeDays / 7) * 100);

            // Get last active date
            const lastActivity = activities.length > 0 ? activities[activities.length - 1].createdAt : null;

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                consistencyScore,
                lastActive: lastActivity,
                totalActivities: activities.length
            };
        }));

        res.status(200).json(studentStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific student analytics
// @route   GET /api/educator/student/:id/analytics
// @access  Private/Educator
const getStudentAnalytics = async (req, res) => {
    try {
        const studentId = req.params.id;
        console.log(`Backend: Request for analytics studentId=${studentId}`);

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            console.log('Backend: Invalid Student ID');
            return res.status(400).json({ message: 'Invalid Student ID provided' });
        }

        const activities = await Activity.find({ student: studentId });
        console.log(`Backend: Found ${activities.length} activities`);
        const studentUser = await User.findById(studentId);

        if (!studentUser) {
            console.log('Backend: Student user not found');
            return res.status(404).json({ message: 'Student not found' });
        }
        console.log('Backend: Student user found, calculating analytics...');

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
                .filter(a => a.createdAt && a.createdAt.toISOString().split('T')[0] === dateString)
                .reduce((acc, curr) => acc + curr.duration, 0);

            last7Days.push({
                name: dayName,
                minutes: dailyDuration
            });
        }

        // Calculate Consistency Score
        const activeDays = last7Days.filter(day => day.minutes > 0).length;
        const consistencyScore = Math.round((activeDays / 7) * 100);

        // Heatmap Data
        const heatmapData = activities.reduce((acc, curr) => {
            if (!curr.createdAt) return acc;
            const date = curr.createdAt.toISOString().split('T')[0];
            const existing = acc.find(item => item.date === date);
            if (existing) {
                existing.count += 1;
                existing.duration += curr.duration;
            } else {
                acc.push({ date, count: 1, duration: curr.duration });
            }
            return acc;
        }, []);

        // Goal Progress
        const weeklyGoal = studentUser.weeklyGoal || 10;
        const currentWeekStart = new Date();
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
        currentWeekStart.setHours(0, 0, 0, 0);

        const currentWeekDuration = activities
            .filter(a => new Date(a.createdAt) >= currentWeekStart)
            .reduce((acc, curr) => acc + curr.duration, 0);

        const currentWeekHours = (currentWeekDuration / 60).toFixed(1);
        const goalProgress = Math.min(Math.round((currentWeekHours / weeklyGoal) * 100), 100);

        console.log('Backend: Analytics calculation successful');
        res.status(200).json({
            totalHours,
            consistencyScore,
            subjectData,
            weeklyData: last7Days,
            totalActivities: activities.length,
            heatmapData,
            weeklyGoal,
            currentWeekHours,
            goalProgress,
            remainingHours: String(Math.max(0, (weeklyGoal - currentWeekHours).toFixed(1)))
        });

    } catch (error) {
        console.error('Backend Error in getStudentAnalytics:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all educators (for students to pick)
// @route   GET /api/educator/list
// @access  Private
const getEducators = async (req, res) => {
    try {
        const educators = await User.find({ role: 'educator' }).select('name email');
        res.status(200).json(educators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudentStats,
    getStudentAnalytics,
    getEducators,
};
