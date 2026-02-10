const API_URL = 'http://localhost:5000/api';
let metricsChart = null;

// Utility to show message
function showMessage(message, type = 'success') {
  const msgDiv = document.getElementById('message');
  msgDiv.className = `message ${type}`;
  msgDiv.textContent = message;
  msgDiv.style.display = 'block';
  setTimeout(() => msgDiv.style.display = 'none', 3000);
}

// Show/hide sections
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  
  // Show selected section
  document.getElementById(sectionId).classList.add('active');
  event.target.classList.add('active');
  
  // Load data if needed
  if (sectionId === 'learners') loadLearners();
  if (sectionId === 'evaluations') loadEvaluations();
  if (sectionId === 'logs') {
    loadRegistrationLogs();
    loadLoginLogs();
  }
}

// Auth functions
async function registerUser(e) {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const name = document.getElementById('reg-name').value;
  const password = document.getElementById('reg-password').value;
  
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    });
    
    const data = await res.json();
    if (res.ok) {
      showMessage('User registered successfully!', 'success');
      document.querySelector('form').reset();
    } else {
      showMessage(data.error || 'Registration failed', 'error');
    }
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data.user));
      showMessage('Logged in successfully!', 'success');
      document.querySelector('form').reset();
    } else {
      showMessage(data.error || 'Login failed', 'error');
    }
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// Learner functions
async function addLearner(e) {
  e.preventDefault();
  const userId = document.getElementById('learner-userid').value;
  const enrollment = document.getElementById('learner-enrollment').value;
  
  try {
    const res = await fetch(`${API_URL}/learners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: parseInt(userId), enrollment })
    });
    
    const data = await res.json();
    if (res.ok) {
      showMessage('Learner added successfully!', 'success');
      document.querySelector('form').reset();
      loadLearners();
    } else {
      showMessage(data.error || 'Failed to add learner', 'error');
    }
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function loadLearners() {
  try {
    const res = await fetch(`${API_URL}/learners`);
    const learners = await res.json();
    
    const tbody = document.getElementById('learners-list');
    if (learners.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No learners yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = learners.map(l => `
      <tr>
        <td>${l.id}</td>
        <td>${l.userId}</td>
        <td>${l.enrollment}</td>
        <td><button class="delete-btn" onclick="deleteLearner(${l.id})">Delete</button></td>
      </tr>
    `).join('');
  } catch (err) {
    showMessage('Failed to load learners: ' + err.message, 'error');
  }
}

async function deleteLearner(id) {
  if (!confirm('Are you sure?')) return;
  
  try {
    await fetch(`${API_URL}/learners/${id}`, { method: 'DELETE' });
    showMessage('Learner deleted!', 'success');
    loadLearners();
  } catch (err) {
    showMessage('Failed to delete learner', 'error');
  }
}

// Evaluation functions
async function addEvaluation(e) {
  e.preventDefault();
  const learnerId = parseInt(document.getElementById('eval-learnerid').value);
  const attendance = parseInt(document.getElementById('eval-attendance').value);
  const performance = parseInt(document.getElementById('eval-performance').value);
  const participation = parseInt(document.getElementById('eval-participation').value);
  const assignments = parseInt(document.getElementById('eval-assignments').value);
  
  try {
    const res = await fetch(`${API_URL}/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId, attendance, performance, participation, assignments })
    });
    
    const data = await res.json();
    if (res.ok) {
      showMessage('Evaluation added successfully!', 'success');
      document.querySelector('form').reset();
      loadEvaluations();
    } else {
      showMessage(data.error || 'Failed to add evaluation', 'error');
    }
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function loadEvaluations() {
  try {
    const res = await fetch(`${API_URL}/evaluations`);
    const evaluations = await res.json();
    
    const container = document.getElementById('evaluations-list');
    
    if (evaluations.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999;">No evaluations yet</p>';
      document.getElementById('stat-total').textContent = '0';
      document.getElementById('stat-avg').textContent = '0%';
      document.getElementById('stat-attendance').textContent = '0%';
      document.getElementById('stat-performance').textContent = '0%';
      if (metricsChart) metricsChart.destroy();
      return;
    }
    
    // Calculate statistics
    const avgOverallScore = (evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length).toFixed(2);
    const avgAttendance = (evaluations.reduce((sum, e) => sum + e.attendance, 0) / evaluations.length).toFixed(2);
    const avgPerformance = (evaluations.reduce((sum, e) => sum + e.performance, 0) / evaluations.length).toFixed(2);
    const avgParticipation = (evaluations.reduce((sum, e) => sum + e.participation, 0) / evaluations.length).toFixed(2);
    const avgAssignments = (evaluations.reduce((sum, e) => sum + e.assignments, 0) / evaluations.length).toFixed(2);
    
    // Update stats
    document.getElementById('stat-total').textContent = evaluations.length;
    document.getElementById('stat-avg').textContent = avgOverallScore + '%';
    document.getElementById('stat-attendance').textContent = avgAttendance + '%';
    document.getElementById('stat-performance').textContent = avgPerformance + '%';
    
    // Render chart
    renderChart(evaluations, avgAttendance, avgPerformance, avgParticipation, avgAssignments);
    
    // Render detailed evaluations
    container.innerHTML = evaluations.map(e => `
      <div class="eval-item">
        <h4>Learner ID: ${e.learnerId}</h4>
        <div class="eval-metrics">
          <div class="metric">
            <div class="metric-label">Attendance</div>
            <div class="metric-value">${e.attendance}%</div>
            <div class="progress-bar"><div class="progress-fill" style="width: ${e.attendance}%"></div></div>
          </div>
          <div class="metric">
            <div class="metric-label">Performance</div>
            <div class="metric-value">${e.performance}%</div>
            <div class="progress-bar"><div class="progress-fill" style="width: ${e.performance}%"></div></div>
          </div>
          <div class="metric">
            <div class="metric-label">Participation</div>
            <div class="metric-value">${e.participation}%</div>
            <div class="progress-bar"><div class="progress-fill" style="width: ${e.participation}%"></div></div>
          </div>
          <div class="metric">
            <div class="metric-label">Assignments</div>
            <div class="metric-value">${e.assignments}%</div>
            <div class="progress-bar"><div class="progress-fill" style="width: ${e.assignments}%"></div></div>
          </div>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd;">
          <strong>Overall Score: <span style="color: #667eea; font-size: 18px;">${e.overallScore.toFixed(2)}%</span></strong>
        </div>
      </div>
    `).join('');
  } catch (err) {
    showMessage('Failed to load evaluations: ' + err.message, 'error');
  }
}

function renderChart(evaluations, avgAttendance, avgPerformance, avgParticipation, avgAssignments) {
  const ctx = document.getElementById('metricsChart');
  
  if (!ctx) return;
  
  if (metricsChart) {
    metricsChart.destroy();
  }
  
  metricsChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Attendance', 'Performance', 'Participation', 'Assignments'],
      datasets: [
        {
          label: 'Average Scores',
          data: [avgAttendance, avgPerformance, avgParticipation, avgAssignments],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { size: 12 }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          }
        }
      }
    }
  });
}

// Log functions
async function loadRegistrationLogs() {
  try {
    const res = await fetch(`${API_URL}/logs/registrations`);
    const data = await res.text();
    document.getElementById('registrations-log').textContent = data;
  } catch (err) {
    showMessage('Failed to load registration logs: ' + err.message, 'error');
  }
}

async function loadLoginLogs() {
  try {
    const res = await fetch(`${API_URL}/logs/logins`);
    const data = await res.text();
    document.getElementById('logins-log').textContent = data;
  } catch (err) {
    showMessage('Failed to load login logs: ' + err.message, 'error');
  }
}

function downloadCSV(type) {
  const endpoint = type === 'registrations' ? '/api/logs/registrations' : '/api/logs/logins';
  const filename = type === 'registrations' ? 'registrations.csv' : 'logins.csv';
  
  fetch(`http://localhost:5000${endpoint}`)
    .then(res => res.text())
    .then(data => {
      const link = document.createElement('a');
      link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
      link.download = filename;
      link.click();
    })
    .catch(err => showMessage('Failed to download CSV: ' + err.message, 'error'));
}
