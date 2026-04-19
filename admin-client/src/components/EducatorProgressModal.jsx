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
                const response = await fetch(`https://student-learning-consistency-evaluation-b26h.onrender.com/api/admin/educators/${educator._id}/analytics`, {
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
                        <div className="relative">
                            <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/30">
                                <FaChartLine size={28} className="text-green-300" />
                            </div>
                            {analytics?.isActiveToday && (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-[#1a2b4a] animate-pulse">
                                    ACTIVE
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black tracking-tight">{educator.name}'s Activity</h2>
                                {analytics?.isActiveToday && (
                                    <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30 uppercase tracking-widest">
                                        Online Today
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm font-medium">{educator.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 flex items-center gap-2 hover:text-white transition-all bg-white/5 p-2.5 px-4 rounded-xl hover:bg-white/10 hover:-translate-x-1">
                        <FaTimes size={18} />
                        <span className="text-sm font-bold uppercase tracking-wider">Back</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent shadow-lg"></div>
                            <p className="text-blue-600 font-bold animate-pulse">Loading Analytics...</p>
                        </div>
                    ) : analytics ? (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                                    <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600">
                                        <FaBullseye size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Consistency</p>
                                        <h3 className="text-2xl font-black text-gray-900">{analytics.consistencyScore}%</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                                    <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Student Rating</p>
                                        <h3 className="text-2xl font-black text-gray-900">{analytics.avgRating || '—'}</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                                    <div className="bg-indigo-50 p-3.5 rounded-xl text-indigo-600">
                                        <FaCommentDots size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Ratings</p>
                                        <h3 className="text-2xl font-black text-gray-900">{analytics.totalRatings}</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                                    <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600">
                                        <FaCalendarAlt size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly Minutes</p>
                                        <h3 className="text-2xl font-black text-gray-900">{analytics.currentWeekHours}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Weekly Activity Chart */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Dash Activity (Week)</h3>
                                        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-lg text-gray-500 font-bold">MINUTES ACTIVE</span>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.weeklyData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} axisLine={false} tickLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                                    cursor={{ fill: '#f8fafc' }}
                                                />
                                                <Bar dataKey="minutes" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Subject Distribution Chart */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Student Feedback Overview</h3>
                                        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-lg text-gray-500 font-bold">RATING DISTRIBUTION</span>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics.subjectData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={90}
                                                    fill="#8884d8"
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                >
                                                    {analytics.subjectData?.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                                />
                                                <Legend iconType="circle" />
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
