import React, { useState } from 'react';
import { TrendingUp, Mail, MessageSquare } from 'lucide-react';
import FeedbackForm from '../FeedbackForm';
import StudentProgressModal from '../StudentProgressModal';
import MessageListModal from '../MessageListModal';

const StudentManagement = ({
    students,
    studentUnreadCounts,
    fetchUnreadCount,
    fetchPerStudentUnreadCounts
}) => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [viewingProgress, setViewingProgress] = useState(null);
    const [showMessages, setShowMessages] = useState(false);
    const [targetChatUser, setTargetChatUser] = useState(null);

    // Sorting/Filtering logic could go here

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800">Student List</h3>
                <div className="flex gap-2">
                    {/* Filters or Search could go here */}
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Student Name
                            </th>
                            <th className="px-6 py-4 border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Consistency Score
                            </th>
                            <th className="px-6 py-4 border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Last Active
                            </th>
                            <th className="px-6 py-4 border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            <div className="text-xs text-gray-500">{student.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center max-w-[200px]">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-500 ${student.consistencyScore >= 80
                                                        ? 'bg-green-500'
                                                        : student.consistencyScore >= 50
                                                            ? 'bg-yellow-400'
                                                            : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${student.consistencyScore}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{student.consistencyScore}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                        {student.lastActive
                                            ? new Date(student.lastActive).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                                            : 'Never'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setViewingProgress(student)}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors"
                                            title="View Analysis"
                                        >
                                            <TrendingUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setTargetChatUser({ id: student._id, name: student.name });
                                                setShowMessages(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors relative"
                                            title="Messages"
                                        >
                                            <Mail className="h-4 w-4" />
                                            {studentUnreadCounts[student._id] > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                                                    {studentUnreadCounts[student._id]}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setSelectedStudent(student)}
                                            className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-lg hover:bg-green-100 transition-colors"
                                            title="Give Feedback"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No students found assigned to you.
                    </div>
                )}
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

export default StudentManagement;
