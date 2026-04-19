import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://student-learning-consistency-evaluation-bij4.onrender.com/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let store;
export const injectStore = (_store) => {
    store = _store;
};

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Prefer Redux state token if available (prevents cross-tab localstorage pollution)
        if (store) {
            const state = store.getState();
            if (state.auth?.user?.token) {
                config.headers.Authorization = `Bearer ${state.auth.user.token}`;
                return config;
            }
        }

        // Fallback to localStorage if store isn't injected yet
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
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
        const message = (error.response && error.response.data && error.response.data.message) || error.message || 'Something went wrong';

        // Global error handling
        if (error.response && error.response.status === 401) {
            // Unauthorized - could trigger logout here if needed
            // localStorage.removeItem('user');
            // window.location.href = '/login';
        }

        // Show toast for error
        toast.error(message, {
            id: message, // Prevent duplicate toasts for the same message
        });

        return Promise.reject(error);
    }
);

export default axiosInstance;
