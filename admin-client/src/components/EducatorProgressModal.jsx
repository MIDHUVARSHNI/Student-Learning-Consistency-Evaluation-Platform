import React, { useEffect, useState } from 'react';
import { FaTimes, FaChartLine, FaUserGraduate, FaCommentDots, FaBullseye, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const EducatorProgressModal = ({ educator, onClose }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user: adminUser } = useAuth();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/admin/educators/${educator._id}/analytics`, {
                    headers: {
                        Authorization: `Bearer ${adminUser.token}`,
                    },
                });
                const data = await response.json();
                setAnalytics(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (educator) {
            fetchAnalytics();
        }
    }, [educator]);

    if (!educator) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-[#1a2b4a] p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-500/20 p-3 rounded-full">
                            <FaChartLine size={28} className="text-green-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{educator.name}'s Activity</h2>
                            <p className="text-green-200 text-sm">{educator.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4a]"></div>
                        </div>
                    ) : analytics ? (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="bg-green-100 p-3 rounded-lg text-green-600">
                                        <FaBullseye size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Activity Score</p>
                                        <h3 className="text-2xl font-bold text-gray-800">{analytics.consistencyScore}%</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                        <FaCommentDots size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Feedback Given</p>
                                        <h3 className="text-2xl font-bold text-gray-800">{analytics.totalHours}</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                                        <FaUserGraduate size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Students</p>
                                        <h3 className="text-2xl font-bold text-gray-800">{analytics.subjectData?.find(s => s.name === 'Students Mentored')?.value || 0}</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                                        <FaCalendarAlt size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Weekly Activity</p>
                                        <h3 className="text-2xl font-bold text-gray-800">{analytics.currentWeekHours}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Weekly Activity Chart */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Feedback Activity</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.weeklyData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                                <YAxis stroke="#9ca3af" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    cursor={{ fill: '#f3f4f6' }}
                                                />
                                                <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Subject Distribution Chart */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Distribution</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics.subjectData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {analytics.subjectData?.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-20">No data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducatorProgressModal;
