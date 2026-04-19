const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    const user = await User.findOne({ name: /Sachin Chatterjee/i });
    console.log("USER DETAILS:", user);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
