import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck } from 'lucide-react';

const Navbar = () => {
    const { logout, user } = useAuth();

    return (
        <nav className="bg-[#1a2b4a] shadow-lg mb-8 text-white relative z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/dashboard" className="flex items-center gap-4 group">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                        <ShieldCheck size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-extrabold tracking-tight text-white leading-tight">Consistify</span>
                        <span className="text-xs text-blue-300 font-medium tracking-wider uppercase">Admin Portal</span>
                    </div>
                </Link>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <span className="block text-sm font-medium text-blue-100">Welcome back,</span>
                        <span className="block text-sm font-bold text-white">{user?.name}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-200 hover:text-red-100 border border-red-500/20 px-4 py-2 rounded-lg transition-all duration-200"
                    >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
