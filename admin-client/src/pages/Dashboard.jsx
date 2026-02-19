import { Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-between w-full">
                    <span className="flex items-center gap-3">
                        <ShieldCheck className="text-blue-600" size={36} />
                        Admin Dashboard
                    </span>
                </h1>
                <p className="text-gray-600 mt-2">Manage your institution's educators and students from a central hub.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                <Link
                    to="/educators"
                    className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                    <div className="p-8 flex items-center gap-6">
                        <div className="bg-blue-50 p-4 rounded-2xl group-hover:bg-blue-100 transition-colors duration-300">
                            <GraduationCap size={40} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Educators</h2>
                            <p className="text-gray-500 mt-1">Manage educator accounts, permissions, and details.</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>

                <Link
                    to="/students"
                    className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                    <div className="p-8 flex items-center gap-6">
                        <div className="bg-green-50 p-4 rounded-2xl group-hover:bg-green-100 transition-colors duration-300">
                            <Users size={40} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">Students</h2>
                            <p className="text-gray-500 mt-1">Track student progress, manage profiles, and enrollments.</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
