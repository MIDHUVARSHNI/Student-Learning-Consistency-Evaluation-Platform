import axios from 'axios';
import toast from 'react-hot-toast';

const API_ADMIN_URL = 'http://127.0.0.1:5001/api';

const axiosInstance = axios.create({
    baseURL: API_ADMIN_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const adminData = JSON.parse(localStorage.getItem('adminToken')); // Adjust based on how admin token is stored
        if (adminData) {
            config.headers.Authorization = `Bearer ${adminData}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || 'Admin system error';

        // Global error handling for admin
        if (error.response && error.response.status === 401) {
            // localStorage.clear();
            // window.location.href = '/login';
        }

        // Show toast for admin error
        toast.error(message, {
            id: `admin-${message}`,
        });

        return Promise.reject(error);
    }
);

export default axiosInstance;
