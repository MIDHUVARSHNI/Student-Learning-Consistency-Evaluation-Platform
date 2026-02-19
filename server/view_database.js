const mongoose = require('mongoose');

// MongoDB Connection URI - matches your .env configuration
const MONGO_URI = 'mongodb://localhost:27017/slcep';

async function viewData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully!\n');

        // Access the users collection
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Find all students
        const students = await usersCollection.find({ role: 'student' }).toArray();

        if (students.length === 0) {
            console.log('No students found in the database.');
        } else {
            console.log(`Found ${students.length} student(s):\n`);
            console.table(students.map(s => ({
                ID: s._id.toString(),
                Name: s.name,
                Email: s.email,
                Role: s.role,
                LastActive: s.lastActive || 'N/A'
            })));
        }

    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
        process.exit();
    }
}

viewData();
