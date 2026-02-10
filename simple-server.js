const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const dataFile = path.join(__dirname, 'data.json');
const registrationsCSV = path.join(__dirname, 'registrations.csv');
const loginsCSV = path.join(__dirname, 'logins.csv');

// Initialize CSV files if they don't exist
function initCSVFiles() {
  if (!fs.existsSync(registrationsCSV)) {
    fs.writeFileSync(registrationsCSV, 'ID,Email,Name,Role,Registration Time\n');
  }
  if (!fs.existsSync(loginsCSV)) {
    fs.writeFileSync(loginsCSV, 'ID,Email,Name,Login Time\n');
  }
}

// Helper to append to CSV
function appendToCSV(filePath, data) {
  fs.appendFileSync(filePath, data + '\n');
}

// Helper to read/write data
function readData() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return { users: [], learners: [], evaluations: [] };
  }

}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());

// Initialize CSV files on startup
initCSVFiles();

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, name, password } = req.body;
  const data = readData();
  
  if (data.users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  
  const user = {
    id: Date.now(),
    email,
    name,
    password,
    role: 'student'
  };
  
  data.users.push(user);
  writeData(data);
  
  // Log registration to CSV
  const timestamp = new Date().toISOString();
  const csvLine = `${user.id},"${email}","${name}","student","${timestamp}"`;
  appendToCSV(registrationsCSV, csvLine);
  
  res.json({ user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const data = readData();
  const user = data.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Log login to CSV
  const timestamp = new Date().toISOString();
  const csvLine = `${user.id},"${email}","${user.name}","${timestamp}"`;
  appendToCSV(loginsCSV, csvLine);
  
  res.json({ user });
});

// Learner endpoints
app.get('/api/learners', (req, res) => {
  const data = readData();
  res.json(data.learners);
});

app.post('/api/learners', (req, res) => {
  const { userId, enrollment } = req.body;
  const data = readData();
  
  const learner = {
    id: Date.now(),
    userId,
    enrollment,
    createdAt: new Date().toISOString()
  };
  
  data.learners.push(learner);
  writeData(data);
  res.status(201).json(learner);
});

// Evaluation endpoints
app.get('/api/evaluations', (req, res) => {
  const data = readData();
  res.json(data.evaluations);
});

app.post('/api/evaluations', (req, res) => {
  const { learnerId, attendance, performance, participation, assignments } = req.body;
  const data = readData();
  
  const overallScore = (attendance + performance + participation + assignments) / 4;
  const evaluation = {
    id: Date.now(),
    learnerId,
    attendance,
    performance,
    participation,
    assignments,
    overallScore,
    createdAt: new Date().toISOString()
  };
  
  data.evaluations.push(evaluation);
  writeData(data);
  res.status(201).json(evaluation);
});

// Log endpoints to view CSV data
app.get('/api/logs/registrations', (req, res) => {
  try {
    const content = fs.readFileSync(registrationsCSV, 'utf8');
    res.setHeader('Content-Type', 'text/csv');
    res.send(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read registrations log' });
  }
});

app.get('/api/logs/logins', (req, res) => {
  try {
    const content = fs.readFileSync(loginsCSV, 'utf8');
    res.setHeader('Content-Type', 'text/csv');
    res.send(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read logins log' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
