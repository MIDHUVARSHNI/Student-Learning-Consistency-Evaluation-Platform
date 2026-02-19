import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const PrivateRoute = () => {
    const { user } = useAuth();

    return user ? (
        <>
            <Navbar />
            <div className="container mx-auto p-4">
                <Outlet />
            </div>
        </>
    ) : (
        <Navigate to="/login" replace />
    );
};

export default PrivateRoute;
