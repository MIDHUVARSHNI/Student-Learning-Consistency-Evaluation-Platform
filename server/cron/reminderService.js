const cron = require('node-cron');
const User = require('../models/User');
const Activity = require('../models/Activity');
const sendEmail = require('../utils/emailService');

const checkInactivityAndSendEmails = async () => {
    console.log('Running inactivity check...');
    try {
        const users = await User.find({});
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        for (const user of users) {
            // Find last activity
            const lastActivity = await Activity.findOne({ student: user._id }).sort({ createdAt: -1 });

            let shouldRemind = false;

            if (!lastActivity) {
                // If user created account > 3 days ago and has no activity
                if (new Date(user.createdAt) < threeDaysAgo) {
                    shouldRemind = true;
                }
            } else {
                if (new Date(lastActivity.createdAt) < threeDaysAgo) {
                    shouldRemind = true;
                }
            }

            if (shouldRemind) {
                const message = `Hi ${user.name},\n\nWe sort of miss you! You haven't logged any study activity in the last 3 days. Consistency is key to success!\n\nLog your activity now to keep your streak alive.`;

                try {
                    await sendEmail({
                        email: user.email,
                        subject: 'We Miss You! - Consistify Reminder',
                        message,
                    });
                    console.log(`Reminder email sent to ${user.email}`);
                } catch (error) {
                    console.error(`Failed to send email to ${user.email}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
};

const startReminderService = () => {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', () => {
        checkInactivityAndSendEmails();
    });
    console.log('Reminder service started (Daily at 9:00 AM)');
};

module.exports = startReminderService;
