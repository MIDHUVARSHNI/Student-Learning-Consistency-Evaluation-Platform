const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Activity = require('./models/Activity');
const jwt = require('jsonwebtoken');

dotenv.config();

const verifyAnalytics = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const student = await User.findOne({ role: 'student' });
        const admin = await User.findOne({ role: 'admin' });

        if (!student || !admin) {
            console.error('Test users not found');
            process.exit(1);
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('Using Student ID:', student._id);
        console.log('Testing GET /api/admin/students/' + student._id + '/analytics...');

        const response = await fetch(`http://localhost:5001/api/admin/students/${student._id}/analytics`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('API Request Failed:', response.status, error);
        } else {
            const data = await response.json();
            console.log('API Request Successful!');
            console.log('Data Received:', JSON.stringify(data, null, 2));
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyAnalytics();
