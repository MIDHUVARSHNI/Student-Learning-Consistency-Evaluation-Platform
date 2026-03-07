import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../slices/authSlice';
import { LogIn, ShieldCheck, Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';

const Logo = () => (
    <div className="flex items-center justify-center mb-6">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-xl transform rotate-3">
                <GraduationCap size={40} className="text-white" />
            </div>
        </div>
    </div>
);

const LoginStudent = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            alert(message);
        }

        if (isSuccess || user) {
            navigate('/');
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = { email, password };
        dispatch(login(userData));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] overflow-hidden relative font-sans">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,112,184,0.1)] border border-gray-100 relative z-10 text-center">
                <Logo />

                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Student Portal</h2>
                    <p className="text-gray-500 font-medium tracking-wide">Enter your student credentials</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6 text-left">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
                                placeholder="Student Email"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
                                placeholder="Password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full group bg-[#2563eb] text-white py-4 rounded-2xl hover:bg-[#1d4ed8] transition-all font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In as Student'}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 text-center text-sm font-medium text-gray-500">
                    <p>Are you a faculty member? <Link to="/staff-login" className="text-blue-600 font-bold hover:underline">Staff Login</Link></p>
                    <p>New Student? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create an account</Link></p>
                </div>
            </div>
        </div>
    );
};

export default LoginStudent;
