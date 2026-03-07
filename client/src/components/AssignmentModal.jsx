import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitAssignment, reset } from '../slices/assignmentSlice';
import { X, Send, Link as LinkIcon, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const AssignmentModal = ({ assignment, onClose }) => {
    const [content, setContent] = useState('');
    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.assignments);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            return toast.error('Please provide some content or a link');
        }

        const resultAction = await dispatch(submitAssignment({ id: assignment._id, content }));
        if (submitAssignment.fulfilled.match(resultAction)) {
            toast.success('Assignment submitted successfully!');
            onClose();
        } else {
            toast.error(resultAction.payload || 'Submission failed');
        }
    };

    const isSubmitted = assignment.status === 'submitted';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 flex justify-between items-start text-white">
                    <div>
                        <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                            {assignment.subject}
                        </span>
                        <h2 className="text-xl font-extrabold leading-tight">{assignment.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Details */}
                    <div className="space-y-3">
                        <p className="text-gray-600 text-sm leading-relaxed">{assignment.description}</p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 italic">
                            Due Date: {new Date(assignment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    {/* Submission Status */}
                    {isSubmitted ? (
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center space-y-3">
                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-green-600 mb-2">
                                <FileCheck size={24} />
                            </div>
                            <h3 className="text-green-800 font-bold">Assignment Submitted</h3>
                            <p className="text-sm text-green-700/80">
                                You submitted this on {new Date(assignment.submissionDetails?.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                            <div className="bg-white p-3 rounded-xl border border-green-200 text-xs text-green-800 font-mono break-all text-left">
                                {assignment.submissionDetails?.content}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <LinkIcon size={14} /> Your Submission (Link or Text)
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Paste your Google Drive link, GitHub repo, or write your response here..."
                                    className="w-full min-h-[140px] p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-sm leading-relaxed resize-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#1565c0] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#0d47a1] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                            >
                                <Send size={18} />
                                {isLoading ? 'Submitting...' : 'Submit Assignment'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentModal;
