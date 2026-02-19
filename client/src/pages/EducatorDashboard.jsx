import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getStudentStats, reset } from '../slices/educatorSlice';
import { logout } from '../slices/authSlice';
import { LogOut, MessageSquare, TrendingUp, Mail } from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';
import StudentProgressModal from '../components/StudentProgressModal';
import MessageListModal from '../components/MessageListModal';

const EducatorDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [viewingProgress, setViewingProgress] = useState(null);
    const [showMessages, setShowMessages] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [studentUnreadCounts, setStudentUnreadCounts] = useState({});
    const [targetChatUser, setTargetChatUser] = useState(null);

    const { user } = useSelector((state) => state.auth);
    const { students, isStatsLoading, isError, message } = useSelector(
        (state) => state.educator
    );

    const fetchUnreadCount = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            // Only count messages from admin for the top bar
            const { data } = await axios.get('http://localhost:5000/api/messages/unread-count?senderRole=admin', config);
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchPerStudentUnreadCounts = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get('http://localhost:5000/api/messages/unread-counts-by-sender', config);
            setStudentUnreadCounts(data);
        } catch (error) {
            console.error('Error fetching per-student unread counts:', error);
        }
    };

    const sendHeartbeat = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post('http://localhost:5000/api/auth/heartbeat', {}, config);
        } catch (error) {
            console.error('Error sending heartbeat:', error);
        }
    };

    useEffect(() => {
        if (isError) {
            console.log(message);
        }

        if (!user) {
            navigate('/login');
        } else if (user.role !== 'educator' && user.role !== 'admin') {
            navigate('/');
        }

        dispatch(getStudentStats());
        fetchUnreadCount();
        fetchPerStudentUnreadCounts();
        sendHeartbeat();

        // Polling
        const countInterval = setInterval(() => {
            fetchUnreadCount();
            fetchPerStudentUnreadCounts();
        }, 30000); // 30 seconds
        const heartbeatInterval = setInterval(sendHeartbeat, 60000); // 1 minute

        return () => {
            clearInterval(countInterval);
            clearInterval(heartbeatInterval);
            dispatch(reset());
        };
    }, [user, navigate, isError, message, dispatch]);

    const onLogout = () => {
        dispatch(logout());
        navigate('/login');
    }

    if (isStatsLoading && students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <div className="text-xl font-bold text-gray-800 animate-pulse mb-8">Loading Educator Dashboard...</div>

                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 max-w-sm text-center">
                    <p className="text-sm text-gray-600 mb-4">Stuck? Try logging in again.</p>
                    <button
                        onClick={onLogout}
                        className="text-indigo-600 font-bold hover:underline flex items-center justify-center gap-2 w-full"
                    >
                        <LogOut size={16} /> Back to Login Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Consistify Educator Dashboard</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setTargetChatUser(null);
                            setShowMessages(true);
                        }}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-lg transition-colors relative"
                    >
                        <Mail className="mr-2 h-5 w-5" /> Messages
                        {unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <div className="flex items-center">
                        <span className="mr-4 text-gray-600">Welcome, {user && user.name}</span>
                        <button onClick={onLogout} className="flex items-center text-red-500 hover:text-red-700">
                            <LogOut className="mr-2 h-5 w-5" /> Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Student Name
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Consistency Score
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Last Active
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student._id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <div className="flex items-center">
                                        <div className="ml-3">
                                            <p className="text-gray-900 whitespace-no-wrap font-semibold">{student.name}</p>
                                            <p className="text-gray-600 whitespace-no-wrap text-xs">{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                            <div className={`h-2.5 rounded-full ${student.consistencyScore >= 80 ? 'bg-green-600' : student.consistencyScore >= 50 ? 'bg-yellow-400' : 'bg-red-600'}`} style={{ width: `${student.consistencyScore}%` }}></div>
                                        </div>
                                        <span className="text-gray-900 font-bold">{student.consistencyScore}%</span>
                                    </div>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                        {student.lastActive ? new Date(student.lastActive).toLocaleString() : 'Never'}
                                    </p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => setViewingProgress(student)}
                                            className="text-green-600 hover:text-green-800 flex items-center"
                                            title="View Analysis"
                                        >
                                            <TrendingUp className="h-5 w-5 mr-1" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setTargetChatUser({ id: student._id, name: student.name });
                                                setShowMessages(true);
                                            }}
                                            className="text-indigo-600 hover:text-indigo-800 flex items-center relative"
                                            title="Student Doubts/Messages"
                                        >
                                            <Mail className="h-5 w-5 mr-1" />
                                            {studentUnreadCounts[student._id] > 0 && (
                                                <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full border border-white">
                                                    {studentUnreadCounts[student._id]}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setSelectedStudent(student)}
                                            className="text-blue-500 hover:text-blue-700 flex items-center"
                                            title="Give Feedback"
                                        >
                                            <MessageSquare className="h-5 w-5 mr-1" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && <div className="p-4 text-center text-gray-500">No students found</div>}
            </div>

            {selectedStudent && (
                <FeedbackForm
                    studentId={selectedStudent._id}
                    studentName={selectedStudent.name}
                    onClose={() => setSelectedStudent(null)}
                />
            )}

            {viewingProgress && (
                <StudentProgressModal
                    studentId={viewingProgress._id}
                    studentName={viewingProgress.name}
                    onClose={() => setViewingProgress(null)}
                />
            )}

            {showMessages && (
                <MessageListModal
                    onClose={() => {
                        setShowMessages(false);
                        fetchUnreadCount();
                        fetchPerStudentUnreadCounts();
                    }}
                    targetUser={targetChatUser}
                />
            )}
        </div>
    );
};

export default EducatorDashboard;
