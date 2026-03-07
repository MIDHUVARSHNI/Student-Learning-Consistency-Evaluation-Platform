import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginStudent from './pages/LoginStudent';
import LoginStaff from './pages/LoginStaff';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EducatorDashboard from './pages/EducatorDashboard';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <ErrorBoundary>
      <Router>
        <>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={
              user ? (
                user.role === 'educator' || user.role === 'admin' ? (
                  <EducatorDashboard />
                ) : (
                  <Dashboard />
                )
              ) : (
                <Navigate to="/student-login" />
              )
            } />
            <Route path="/student-login" element={<LoginStudent />} />
            <Route path="/staff-login" element={<LoginStaff />} />
            <Route path="/login" element={<Navigate to="/student-login" />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
