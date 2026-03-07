const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'AIDS', 'BT'];
const YEARS = ['be1', 'be2', 'be3', 'be4', 'msc1', 'msc2', 'mba1', 'mba2', 'mtech1', 'mtech2'];

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const seedStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing students to avoid duplicates if re-running
        // await User.deleteMany({ role: 'student' });
        // console.log('Cleared existing students.');

        const rawStudents = [];
        for (let i = 0; i < 60; i++) { // Generate 60 to be safe
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@college.edu`;
            const department = DEPARTMENTS[i % DEPARTMENTS.length];
            const year = YEARS[i % YEARS.length];

            rawStudents.push({
                name,
                email,
                password: 'password123',
                role: 'student',
                department,
                year,
            });
        }

        // Sort by year, then department, then name to assign proper roll numbers
        rawStudents.sort((a, b) => {
            if (a.year !== b.year) return a.year.localeCompare(b.year);
            if (a.department !== b.department) return a.department.localeCompare(b.department);
            return a.name.localeCompare(b.name);
        });

        // Assign roll numbers
        const counter = {}; // year-dept -> counter
        const studentsWithRoll = rawStudents.map(s => {
            const key = `${s.year}-${s.department}`;
            counter[key] = (counter[key] || 0) + 1;
            const prefix = s.department.substring(0, 2).toUpperCase();
            const yearDigit = s.year.replace(/\D/g, '') || '1';
            const rollNo = `${prefix}${yearDigit}${String(counter[key]).padStart(3, '0')}`;
            return { ...s, rollNo };
        });

        console.log(`Seeding ${studentsWithRoll.length} students...`);

        // Use create individually to ensure hashing works if many re-saves happen, 
        // or just ensure bcrypt middleware handles it. create() on an array works well.
        await User.create(studentsWithRoll);

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedStudents();
