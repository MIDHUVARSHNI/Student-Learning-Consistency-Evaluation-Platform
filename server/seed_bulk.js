/**
 * Bulk Seed Script — 600 Students + 100 Faculty
 * Run: node seed_bulk.js
 * ⚠️  Clears ALL existing students and educators before seeding!
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

/* ─── Configuration ─── */
const TOTAL_STUDENTS = 600;
const TOTAL_FACULTY = 100;

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'AIDS', 'BT', 'CHEM', 'MBA'];
const YEARS = ['be1', 'be2', 'be3', 'be4', 'msc1', 'msc2', 'mba1', 'mba2', 'mtech1', 'mtech2'];

/* ─── Regional name pools ─── */
const firstNames = [
    // South Indian
    'Arjun', 'Priya', 'Ravi', 'Sneha', 'Karthik', 'Divya', 'Suresh', 'Anitha', 'Vijay', 'Lakshmi',
    'Muthu', 'Kavitha', 'Senthil', 'Meena', 'Rajesh', 'Saranya', 'Murugan', 'Deepa', 'Prasad', 'Nithya',
    // North Indian
    'Rahul', 'Pooja', 'Amit', 'Neha', 'Vikram', 'Rani', 'Sunil', 'Anjali', 'Raj', 'Simran',
    'Rohit', 'Nisha', 'Manish', 'Kavya', 'Sanjay', 'Ritika', 'Dinesh', 'Sweta', 'Ajay', 'Preeti',
    // East Indian
    'Sourav', 'Puja', 'Subhash', 'Mala', 'Debashish', 'Ritu', 'Tapan', 'Nupur', 'Biswas', 'Ananya',
    // West Indian
    'Nilesh', 'Kajal', 'Pratik', 'Dharini', 'Sachin', 'Bhavna', 'Vinod', 'Hetal', 'Kishore', 'Rupal',
    // North-East / Tribal
    'Biju', 'Tara', 'Romen', 'Lalita', 'Manohar', 'Chandana', 'Hemanta', 'Prativa', 'Mridul', 'Somi',
    // Muslim names
    'Mohammed', 'Aisha', 'Hassan', 'Fatima', 'Imran', 'Zara', 'Shahid', 'Noor', 'Farhan', 'Sana',
    // Christian names
    'John', 'Mary', 'Peter', 'Susan', 'James', 'Jennifer', 'Paul', 'Lisa', 'George', 'Sarah',
    // Misc
    'Chirag', 'Vaishali', 'Yash', 'Disha', 'Naman', 'Payal', 'Harsh', 'Gargi', 'Tushar', 'Mansi',
];

const lastNames = [
    'Kumar', 'Sharma', 'Patel', 'Reddy', 'Singh', 'Gupta', 'Nair', 'Pillai', 'Rao', 'Verma',
    'Iyer', 'Menon', 'Naidu', 'Bose', 'Malhotra', 'Joshi', 'Pandey', 'Das', 'Ghosh', 'Chatterjee',
    'Mehta', 'Shah', 'Jain', 'Kapoor', 'Aggarwal', 'Bansal', 'Khanna', 'Arora', 'Sinha', 'Mishra',
    'Tiwari', 'Dubey', 'Chaudhary', 'Yadav', 'Chauhan', 'Rathore', 'Shukla', 'Tripathi', 'Misra', 'Dwivedi',
    'Mukherjee', 'Banerjee', 'Dey', 'Roy', 'Sengupta', 'Chakraborty', 'Bhattacharya', 'Biswas', 'Mitra', 'Mondal',
    'Naik', 'Hegde', 'Shetty', 'Kamath', 'Gowda', 'Murthy', 'Swamy', 'Rao', 'Bhat', 'Kulkarni',
    'Thakur', 'Chauhan', 'Bhandari', 'Rawat', 'Negi', 'Pandit', 'Bhatt', 'Belwal', 'Kandpal', 'Khanduri',
    'Khan', 'Sheikh', 'Ansari', 'Siddiqui', 'Qureshi', 'Malik', 'Mirza', 'Baig', 'Hussain', 'Ali',
    'Thomas', 'Joseph', 'Mathew', 'George', 'Philip', 'Xavier', 'D\'souza', 'Fernandes', 'Pereira', 'Mascarenhas',
    'Boro', 'Deka', 'Gogoi', 'Hazarika', 'Kalita', 'Borah', 'Doley', 'Saikia', 'Phukan', 'Das',
];

/* ─── Helpers ─── */
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand3 = () => Math.floor(Math.random() * 900 + 100); // 3-digit suffix

/* ─── Build students ─── */
function buildStudents() {
    const used = new Set(); // prevent duplicate emails
    const students = [];

    for (let i = 0; i < TOTAL_STUDENTS; i++) {
        const dept = DEPARTMENTS[i % DEPARTMENTS.length];
        const year = YEARS[i % YEARS.length];
        const first = pick(firstNames);
        const last = pick(lastNames);
        const name = `${first} ${last}`;
        let email;

        do {
            email = `${first.toLowerCase().replace(/[' ]/g, '')}.${last.toLowerCase().replace(/[' ]/g, '')}${rand3()}@college.edu`;
        } while (used.has(email));
        used.add(email);

        students.push({ name, email, password: 'password123', role: 'student', department: dept, year });
    }

    /* Sort: department → name */
    students.sort((a, b) =>
        a.department.localeCompare(b.department) || a.name.localeCompare(b.name)
    );

    /* Assign sequential roll numbers per department */
    const counter = {};
    return students.map(s => {
        const key = s.department;
        counter[key] = (counter[key] || 0) + 1;
        const rollNo = `${s.department}${String(counter[key]).padStart(3, '0')}`;
        return { ...s, rollNo };
    });
}

/* ─── Build faculty ─── */
function buildFaculty() {
    const used = new Set();
    const faculty = [];

    for (let i = 0; i < TOTAL_FACULTY; i++) {
        const dept = DEPARTMENTS[i % DEPARTMENTS.length];
        const first = pick(firstNames);
        const last = pick(lastNames);
        const name = `Dr. ${first} ${last}`;
        let email;

        do {
            email = `prof.${first.toLowerCase().replace(/[' ]/g, '')}.${last.toLowerCase().replace(/[' ]/g, '')}${rand3()}@college.edu`;
        } while (used.has(email));
        used.add(email);

        const collegeId = `FAC${String(i + 1).padStart(4, '0')}`;
        faculty.push({ name, email, password: 'password123', role: 'educator', department: dept, collegeId, year: '' });
    }
    return faculty;
}

/* ─── Main ─── */
const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅  MongoDB Connected');

        /* Wipe existing students + educators */
        const delStudents = await User.deleteMany({ role: 'student' });
        const delFaculty = await User.deleteMany({ role: 'educator' });
        console.log(`🗑   Deleted ${delStudents.deletedCount} students, ${delFaculty.deletedCount} educators`);

        const students = buildStudents();
        const faculty = buildFaculty();

        console.log(`📚  Seeding ${students.length} students…`);
        await User.insertMany(students, { ordered: false });

        console.log(`👩‍🏫  Seeding ${faculty.length} faculty…`);
        await User.insertMany(faculty, { ordered: false });

        console.log('🎉  Seeding complete!');
        console.log(`    Students : ${students.length}`);
        console.log(`    Faculty  : ${faculty.length}`);
        process.exit(0);
    } catch (err) {
        console.error('❌  Seeding failed:', err.message);
        process.exit(1);
    }
};

seed();
