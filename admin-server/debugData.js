const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Activity = require('./models/Activity');
const Message = require('./models/Message');

dotenv.config();

const debugDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({}, 'name email role');
        console.log('--- USERS ---');
        users.forEach(u => console.log(`${u.role.toUpperCase()}: ${u.name} (${u._id})`));

        const activities = await Activity.find({});
        console.log('\n--- ACTIVITIES ---');
        activities.forEach(a => console.log(`Activity: ${a.subject} for Student: ${a.student}`));

        // Simulate Message Sending
        console.log('\n--- SIMULATING MESSAGE ---');
        const admin = await User.findOne({ role: 'admin' });
        const educator = await User.findOne({ role: 'educator' });

        if (admin && educator) {
            console.log(`Attempting to send message from ${admin.name} to ${educator.name}...`);
            try {
                const msg = await Message.create({
                    sender: admin._id,
                    recipient: educator._id,
                    content: 'Test message from debug script'
                });
                console.log('Message created successfully:', msg._id);
            } catch (err) {
                console.error('FAILED to create message:', err.message);
            }
        } else {
            console.log('Cannot test message: Admin or Educator not found.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugDB();
