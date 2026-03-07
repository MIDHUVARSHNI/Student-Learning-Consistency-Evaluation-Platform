const mongoose = require('mongoose');
const User = require('./models/User');
const UserActivity = require('./models/UserActivity');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyActivityTracking() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const educator = await User.findOne({ role: 'educator' });
        if (!educator) {
            console.log('No educator found to test.');
            return;
        }

        console.log(`Testing for educator: ${educator.email}`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find or create activity for today
        let activity = await UserActivity.findOne({ user: educator._id, date: today });
        const initialMinutes = activity ? activity.minutes : 0;
        console.log(`Initial minutes for today: ${initialMinutes}`);

        // Simulate heartbeat increment
        await UserActivity.findOneAndUpdate(
            { user: educator._id, date: today },
            { $inc: { minutes: 1 } },
            { upsert: true, new: true }
        );

        activity = await UserActivity.findOne({ user: educator._id, date: today });
        console.log(`Minutes after update: ${activity.minutes}`);

        if (activity.minutes === initialMinutes + 1) {
            console.log('SUCCESS: Activity tracking works.');
        } else {
            console.error('FAILURE: Activity count did not increment correctly.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyActivityTracking();
