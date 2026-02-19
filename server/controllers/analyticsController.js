const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Private
// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        const activities = await Activity.find({ student: req.user.id });

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
                .filter(a => a.createdAt.toISOString().split('T')[0] === dateString)
                .reduce((acc, curr) => acc + curr.duration, 0);

            last7Days.push({
                name: dayName,
                minutes: dailyDuration
            });
        }

        // Calculate Consistency Score (Active days in last 7 days)
        const activeDays = last7Days.filter(day => day.minutes > 0).length;
        const consistencyScore = Math.round((activeDays / 7) * 100);

        // Heatmap Data (Last 365 days)
        const heatmapData = activities.reduce((acc, curr) => {
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
        const weeklyGoal = req.user.weeklyGoal || 10; // Default 10 hours
        const currentWeekStart = new Date();
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Sunday
        currentWeekStart.setHours(0, 0, 0, 0);

        const currentWeekDuration = activities
            .filter(a => new Date(a.createdAt) >= currentWeekStart)
            .reduce((acc, curr) => acc + curr.duration, 0);

        const currentWeekHours = (currentWeekDuration / 60).toFixed(1);
        const goalProgress = Math.min(Math.round((currentWeekHours / weeklyGoal) * 100), 100);


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
            remainingHours: Math.max(0, (weeklyGoal - currentWeekHours).toFixed(1))
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAnalytics,
};
