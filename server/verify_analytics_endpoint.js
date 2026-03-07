const mongoose = require('mongoose');
const User = require('./models/User');
const UserActivity = require('./models/UserActivity');
const { getStaffConsistency } = require('./controllers/analyticsController');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyAnalyticsEndpoint() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const educator = await User.findOne({ role: 'educator' });
        if (!educator) {
            console.log('No educator found to test.');
            return;
        }

        console.log(`Testing analytics for educator: ${educator.email}`);

        // Mock request/response
        const req = {
            user: { id: educator._id }
        };
        const res = {
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.data = data;
                return this;
            }
        };

        await getStaffConsistency(req, res);

        console.log('Response Status:', res.statusCode);
        console.log('Weekly Data:', JSON.stringify(res.data.weeklyData, null, 2));
        console.log('Consistency Score:', res.data.consistencyScore);

        if (res.statusCode === 200 && Array.isArray(res.data.weeklyData)) {
            console.log('SUCCESS: Analytics endpoint returns correct structure.');
        } else {
            console.error('FAILURE: Unexpected response structure.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyAnalyticsEndpoint();
