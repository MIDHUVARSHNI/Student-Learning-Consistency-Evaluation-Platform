import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';

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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f172a] overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative z-10">
                <Logo />

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Consistify</h2>
                    <p className="text-blue-400 font-medium tracking-widest uppercase text-xs">Admin Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 text-white border border-gray-700 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500"
                                placeholder="Admin Email"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 text-white border border-gray-700 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500"
                                placeholder="Password"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" className="text-xs text-gray-400 hover:text-blue-400 transition-colors font-medium">
                            Forgot your password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full group bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all font-bold text-lg shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98]"
                    >
                        Sign In
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
