const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword123',
            role: 'admin',
        });

        console.log('Admin user created');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
