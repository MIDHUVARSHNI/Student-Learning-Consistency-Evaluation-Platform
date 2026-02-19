const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const User = require('./server/models/User');
const Activity = require('./server/models/Activity');

async function debugPriya() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const priya = await User.findOne({ name: /priya/i });
        if (!priya) {
            console.log('User "priya" not found');
            process.exit(0);
        }

        console.log('Found User Priya:', {
            _id: priya._id,
            name: priya.name,
            email: priya.email,
            role: priya.role,
            weeklyGoal: priya.weeklyGoal
        });

        const activities = await Activity.find({ student: priya._id }).sort({ createdAt: -1 });
        console.log(`Found ${activities.length} activities for Priya:`);
        activities.forEach(a => {
            console.log(`- ${a.subject}: ${a.duration} mins on ${a.createdAt.toISOString()}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugPriya();
