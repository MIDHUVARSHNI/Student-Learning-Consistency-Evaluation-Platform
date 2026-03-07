import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAssignments, createAssignment, reset, deleteAssignment } from '../slices/assignmentSlice';
import { Plus, ClipboardList, Users, Clock, ChevronRight, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = 'http://127.0.0.1:5000';

const EducatorAssignmentsView = () => {
    const dispatch = useDispatch();
    const { assignments, isLoading } = useSelector(state => state.assignments);
    const { user } = useSelector(state => state.auth);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingSubmissions, setViewingSubmissions] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        dueDate: '',
        department: user?.department || 'CSE',
        year: 'be3'
    });

    useEffect(() => {
        dispatch(getAssignments());
        return () => dispatch(reset());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this assignment?")) {
            dispatch(deleteAssignment(id));
            toast.success("Assignment deleted");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const resultAction = await dispatch(createAssignment(formData));
        if (createAssignment.fulfilled.match(resultAction)) {
            toast.success('Assignment posted!');
            setShowCreateModal(false);
            setFormData({ ...formData, title: '', description: '', subject: '', dueDate: '' });
        } else {
            toast.error(resultAction.payload || 'Failed to post assignment');
        }
    };

    const fetchSubmissions = async (id) => {
        setLoadingSubmissions(true);
        try {
            const { data } = await axios.get(`${API}/api/assignments/${id}/submissions`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSubmissions(data);
        } catch (e) {
            toast.error('Failed to load submissions');
        } finally {
            setLoadingSubmissions(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#1a1a2e]">Manage Assignments</h2>
                    <p className="text-gray-500 text-sm">Create courses, track deadlines, and evaluate student work.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#1565c0] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-[#0d47a1] transition-all active:scale-95"
                >
                    <Plus size={20} /> Post New Assignment
                </button>
            </div>

            {assignments.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                    <ClipboardList size={64} className="mx-auto text-gray-100 mb-4" />
                    <h3 className="text-gray-400 font-bold text-lg">No assignments posted yet.</h3>
                    <p className="text-gray-300 text-sm mt-1">Click the button above to create your first assignment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {assignments.map(a => (
                        <div key={a._id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {a.subject}
                                    </span>
                                    <span className="bg-gray-50 text-gray-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {a.year} - {a.department}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-800">{a.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5"><Users size={14} /> Targeted: Entire Class</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <button
                                    onClick={() => handleDelete(a._id)}
                                    className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-colors flex-1 md:flex-none justify-center"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                                <button
                                    onClick={() => { setViewingSubmissions(a); fetchSubmissions(a._id); }}
                                    className="bg-gray-50 text-gray-600 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors flex-1 md:flex-none justify-center"
                                >
                                    View Submissions <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col mx-auto max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div style={{ padding: '20px 28px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
                            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>New Assignment</h3>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', flexShrink: 0 }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '28px', background: '#fafafa', flex: 1 }}>
                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                {/* Row 1: Title + Subject */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</label>
                                        <input
                                            required
                                            style={{ width: '100%', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', color: '#111827', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                                            placeholder="e.g. Unit 1 Project"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            onFocus={e => { e.target.style.borderColor = '#1565c0'; e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.12)'; }}
                                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subject</label>
                                        <input
                                            required
                                            style={{ width: '100%', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', color: '#111827', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                                            placeholder="e.g. Data Structures"
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                            onFocus={e => { e.target.style.borderColor = '#1565c0'; e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.12)'; }}
                                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Description */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
                                    <textarea
                                        required
                                        style={{ width: '100%', minHeight: 130, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '14px', fontSize: 14, outline: 'none', color: '#111827', resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', fontFamily: 'inherit' }}
                                        placeholder="Write details or instructions here..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        onFocus={e => { e.target.style.borderColor = '#1565c0'; e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.12)'; }}
                                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                                    />
                                </div>

                                {/* Row 3: Due Date + Year */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Due Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            style={{ width: '100%', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', color: '#374151', fontWeight: 500, height: 50, boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                                            value={formData.dueDate}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                            onFocus={e => { e.target.style.borderColor = '#1565c0'; e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.12)'; }}
                                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Year</label>
                                        <select
                                            style={{ width: '100%', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', color: '#374151', fontWeight: 500, height: 50, cursor: 'pointer', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: e.target.value })}
                                            onFocus={e => { e.target.style.borderColor = '#1565c0'; e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.12)'; }}
                                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                                        >
                                            <option value="be1">B.E 1st Year</option>
                                            <option value="be2">B.E 2nd Year</option>
                                            <option value="be3">B.E 3rd Year</option>
                                            <option value="be4">B.E 4th Year</option>
                                            <option value="msc1">M.Sc 1st Year</option>
                                            <option value="msc2">M.Sc 2nd Year</option>
                                            <option value="mba1">MBA 1st Year</option>
                                            <option value="mba2">MBA 2nd Year</option>
                                            <option value="mtech1">M.Tech 1st Year</option>
                                            <option value="mtech2">M.Tech 2nd Year</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div style={{ paddingTop: 8 }}>
                                    <button
                                        type="submit"
                                        style={{ width: '100%', background: '#1565c0', color: '#fff', border: 'none', borderRadius: 12, padding: '15px 0', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 14px rgba(21,101,192,0.3)', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.target.style.background = '#0d47a1'; e.target.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.target.style.background = '#1565c0'; e.target.style.transform = 'translateY(0)'; }}
                                    >
                                        PUBLISH ASSIGNMENT
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Submissions Modal */}
            {viewingSubmissions && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col mx-auto">
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-start bg-white z-10">
                            <div className="overflow-hidden pr-4">
                                <h3 className="text-xl md:text-2xl font-black text-gray-800">Submissions</h3>
                                <p className="text-gray-500 text-sm font-medium mt-1 truncate">{viewingSubmissions.title}</p>
                            </div>
                            <button onClick={() => setViewingSubmissions(null)} className="bg-gray-100 p-2.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors shrink-0">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 space-y-4 rounded-b-3xl">
                            {loadingSubmissions ? (
                                <p className="text-center py-10 text-gray-400">Loading submissions...</p>
                            ) : submissions.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <ClipboardList size={40} className="mx-auto text-gray-200 mb-3" />
                                    <p className="text-gray-500 font-bold">No students have submitted yet.</p>
                                </div>
                            ) : (
                                submissions.map(s => (
                                    <div key={s._id} className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                                                    {s.student?.name?.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-bold text-gray-800 truncate">{s.student?.name}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{s.student?.collegeId}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 font-bold whitespace-nowrap ml-2">
                                                {new Date(s.submittedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs md:text-sm font-mono break-all leading-relaxed whitespace-pre-wrap text-gray-700">
                                            {s.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EducatorAssignmentsView;
