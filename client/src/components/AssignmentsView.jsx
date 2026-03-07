import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAssignments, reset } from '../slices/assignmentSlice';
import { ClipboardList, Clock, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import AssignmentModal from './AssignmentModal';

const AssignmentsView = () => {
    const dispatch = useDispatch();
    const { assignments, isLoading, isError, message } = useSelector(state => state.assignments);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        dispatch(getAssignments());
        return () => dispatch(reset());
    }, [dispatch]);

    if (isLoading) return <div className="p-10 text-center text-gray-400">Loading assignments...</div>;

    const pending = assignments.filter(a => a.status === 'pending');
    const submitted = assignments.filter(a => a.status === 'submitted');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Your Assignments</h2>
                    <p className="text-gray-500 text-sm">Submit your coursework and track your progress.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                        <Clock size={14} /> {pending.length} Pending
                    </div>
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle size={14} /> {submitted.length} Submitted
                    </div>
                </div>
            </div>

            {assignments.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                    <ClipboardList size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-semibold">No assignments posted for your class yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Assignments */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle size={14} className="text-amber-500" /> Pending Action
                        </h3>
                        {pending.length === 0 ? (
                            <div className="bg-gray-50/50 rounded-2xl p-6 border border-dashed border-gray-200 text-center">
                                <p className="text-xs text-gray-400">All caught up! No pending assignments.</p>
                            </div>
                        ) : (
                            pending.map(assignment => (
                                <div
                                    key={assignment._id}
                                    onClick={() => setSelectedAssignment(assignment)}
                                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group flex justify-between items-center"
                                >
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                                            {assignment.subject}
                                        </span>
                                        <h4 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors uppercase">{assignment.title}</h4>
                                        <p className="text-xs text-gray-500 font-medium">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Submitted Assignments */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-500" /> Recently Submitted
                        </h3>
                        {submitted.length === 0 ? (
                            <div className="bg-gray-50/50 rounded-2xl p-6 border border-dashed border-gray-200 text-center">
                                <p className="text-xs text-gray-400">No submissions yet.</p>
                            </div>
                        ) : (
                            submitted.map(assignment => (
                                <div
                                    key={assignment._id}
                                    onClick={() => setSelectedAssignment(assignment)}
                                    className="bg-white/60 p-5 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-white transition-colors"
                                >
                                    <div className="opacity-70">
                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase">
                                            {assignment.subject}
                                        </span>
                                        <h4 className="font-bold text-gray-700">{assignment.title}</h4>
                                        <p className="text-xs text-green-600 font-bold mt-1 tracking-tight">Status: Evaluation Pending</p>
                                    </div>
                                    <CheckCircle size={20} className="text-green-500" />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {selectedAssignment && (
                <AssignmentModal
                    assignment={selectedAssignment}
                    onClose={() => setSelectedAssignment(null)}
                />
            )}
        </div>
    );
};

export default AssignmentsView;
