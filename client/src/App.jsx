import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EducatorDashboard from './pages/EducatorDashboard';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="container mx-auto">
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
              <Navigate to="/login" />
            )
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
