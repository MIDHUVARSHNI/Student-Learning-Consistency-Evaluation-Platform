import React from 'react';
import {
    Users,
    ClipboardCheck,
    Award,
    BookOpen,
    MessageSquare,
    Mail,
    User,
    LogOut
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, userRole }) => {
    const menuItems = [
        { id: 'students', label: 'Student Management', icon: Users },
        { id: 'attendance', label: 'Attendance Management', icon: ClipboardCheck },
        { id: 'marks', label: 'Marks & Evaluation', icon: Award },
        { id: 'courses', label: 'Course / Subject', icon: BookOpen },
        { id: 'feedback', label: 'Feedback & Evaluation', icon: MessageSquare },
        { id: 'communication', label: 'Communication System', icon: Mail },
        { id: 'profile', label: 'Profile & Password', icon: User },
    ];

    return (
        <div className="w-64 bg-indigo-900 text-white min-h-screen flex flex-col transition-all duration-300 shadow-xl">
            <div className="p-6 border-b border-indigo-800">
                <h2 className="text-2xl font-bold tracking-wider">Consistify</h2>
                <div className="mt-2 text-indigo-300 text-sm font-medium px-2 py-1 bg-indigo-800 rounded inline-block">
                    {userRole === 'admin' ? 'Admin Access' : 'Faculty Access'}
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.id} className="mb-1 px-2">
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${activeTab === item.id
                                            ? 'bg-indigo-700 text-white shadow-md'
                                            : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-indigo-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 shadow-md"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
