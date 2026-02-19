import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../slices/authSlice';
import { LogIn, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

const Logo = () => (
    <div className="flex items-center justify-center mb-6">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-xl transform rotate-3">
                <ShieldCheck size={40} className="text-white" />
            </div>
        </div>
    </div>
);

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        collegeId: '',
    });

    const { email, password, collegeId } = formData;

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
        const userData = {
            email,
            password,
            collegeId,
        };
        dispatch(login(userData));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] overflow-hidden relative font-sans">
            {/* Soft decorative backgrounds */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,112,184,0.1)] border border-gray-100 relative z-10 text-center">
                <Logo />

                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Consistify</h2>
                    <p className="text-gray-500 font-medium tracking-wide">Enter your credentials to continue</p>
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
                                placeholder="Email Address"
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

                        {/* College ID for Staff */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                id="collegeId"
                                name="collegeId"
                                value={collegeId || ''}
                                onChange={onChange}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
                                placeholder="College ID (Staff Only)"
                            />
                            <p className="mt-1 ml-4 text-[10px] text-gray-400">* Mandatory for educators</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full group bg-[#2563eb] text-white py-4 rounded-2xl hover:bg-[#1d4ed8] transition-all font-bold text-lg shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-70"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-600">
                    <p>New to Consistify? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create an account</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
