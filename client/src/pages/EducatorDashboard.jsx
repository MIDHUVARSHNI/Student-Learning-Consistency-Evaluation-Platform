import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getStudentStats, reset } from '../slices/educatorSlice';
import { logout } from '../slices/authSlice';
import {
    LogOut, Mail, Bell,
    LayoutDashboard, Users, Building2, BookOpen,
    Calendar, GraduationCap,
    FileText, MessageSquare, ArrowLeft, Send, ChevronRight,
    Activity as FaChartLine
} from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';
import StudentProgressModal from '../components/StudentProgressModal';
import MessageListModal from '../components/MessageListModal';
import TimetableView from '../components/TimetableView';
import MiniCalendarWidget from '../components/MiniCalendarWidget';
import EducatorAssignmentsView from '../components/EducatorAssignmentsView';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const API = 'http://127.0.0.1:5000';

/* ─── Engineering College Departments (static reference) ─── */
const DEPARTMENTS = [
    { id: 'cse', name: 'Computer Science & Engineering', code: 'CSE', subjects: ['Data Structures & Algorithms', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'Software Engineering', 'Artificial Intelligence', 'Machine Learning', 'Web Technologies', 'Compiler Design', 'Theory of Computation'] },
    { id: 'ece', name: 'Electronics & Communication Engineering', code: 'ECE', subjects: ['Circuit Theory', 'Electronic Devices', 'Digital Electronics', 'Signals & Systems', 'Analog Communication', 'Digital Communication', 'VLSI Design', 'Microprocessors', 'Antenna Theory', 'Embedded Systems'] },
    { id: 'mech', name: 'Mechanical Engineering', code: 'MECH', subjects: ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Manufacturing Technology', 'Machine Design', 'Heat Transfer', 'CAD/CAM', 'Robotics', 'Automobile Engineering', 'Industrial Engineering'] },
    { id: 'civil', name: 'Civil Engineering', code: 'CIVIL', subjects: ['Structural Analysis', 'Fluid Mechanics', 'Soil Mechanics', 'Surveying', 'Transportation Engineering', 'Environmental Engineering', 'Concrete Technology', 'Estimation & Costing', 'Hydraulics', 'Foundation Engineering'] },
    { id: 'eee', name: 'Electrical & Electronics Engineering', code: 'EEE', subjects: ['Electrical Circuits', 'Electromagnetic Theory', 'Electrical Machines', 'Power Systems', 'Control Systems', 'Power Electronics', 'Switchgear & Protection', 'High Voltage Engineering', 'Renewable Energy', 'Smart Grid'] },
    { id: 'it', name: 'Information Technology', code: 'IT', subjects: ['Programming in C', 'Data Structures', 'Object Oriented Programming', 'Computer Architecture', 'Network Security', 'Cloud Computing', 'Mobile Application Development', 'Big Data Analytics', 'IoT Systems', 'Cyber Security'] },
    { id: 'ai', name: 'Artificial Intelligence & Data Science', code: 'AIDS', subjects: ['Python Programming', 'Statistics for Data Science', 'Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Data Visualization', 'Big Data Technologies', 'Reinforcement Learning', 'AI Ethics'] },
    { id: 'biotech', name: 'Biotechnology', code: 'BT', subjects: ['Cell Biology', 'Microbiology', 'Biochemistry', 'Molecular Biology', 'Genetic Engineering', 'Bioprocess Engineering', 'Immunology', 'Bioinformatics', 'Fermentation Technology', 'Protein Engineering'] },
];

const YEARS = [
    { id: '1st Year B.E.', label: '1st Year B.E.', short: '1st Year' },
    { id: '2nd Year B.E.', label: '2nd Year B.E.', short: '2nd Year' },
    { id: '3rd Year B.E.', label: '3rd Year B.E.', short: '3rd Year' },
    { id: '4th Year B.E.', label: '4th Year B.E.', short: '4th Year' },
    { id: '1st Year M.Tech', label: '1st Year M.Tech', short: '1st M.Tech' },
    { id: '2nd Year M.Tech', label: '2nd Year M.Tech', short: '2nd M.Tech' },
    { id: '1st Year MBA', label: '1st Year MBA', short: '1st MBA' },
    { id: '2nd Year MBA', label: '2nd Year MBA', short: '2nd MBA' },
    { id: '1st Year MCA', label: '1st Year MCA', short: '1st MCA' },
    { id: '2nd Year MCA', label: '2nd Year MCA', short: '2nd MCA' }
];

/* ─── Sidebar navigation ─── */
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculties', label: 'Faculty', icon: GraduationCap },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'exams', label: 'Upcoming Exams', icon: FileText },
    { id: 'doubts', label: 'Doubt Clarification', icon: MessageSquare },
];

/* ═══════════════════════════════════════════════════════
   FACULTY VIEW — fetches real educators from DB
═══════════════════════════════════════════════════════ */
const FacultyView = ({ token }) => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('All');

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const { data } = await axios.get(`${API}/api/educator/list`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFaculty(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch_();
    }, [token]);

    const depts = ['All', ...Array.from(new Set(faculty.map(f => f.department).filter(Boolean)))];
    const filtered = faculty.filter(f =>
        (filterDept === 'All' || f.department === filterDept) &&
        (f.name?.toLowerCase().includes(search.toLowerCase()) || f.email?.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading faculty…</div>;

    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 18 }}>
                Faculty / Staff <span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>({faculty.length} total)</span>
            </h2>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                    placeholder="Search faculty by name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none', color: '#333' }}
                />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                    style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, color: '#333', background: '#fff', cursor: 'pointer' }}>
                    {depts.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
                    <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ fontWeight: 600 }}>No faculty members found.</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>Faculty are added by the Admin from the Admin Panel.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {filtered.map(f => (
                        <div key={f._id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e8eaf6', boxShadow: '0 2px 12px rgba(21,101,192,.06)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '20px', flexShrink: 0 }}>
                                {f.name?.charAt(0).toUpperCase() || 'F'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a2e', marginBottom: '4px' }}>{f.name}</p>
                                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{f.email}</p>
                                {f.department && (
                                    <span style={{ background: '#e8f0fe', color: '#1565c0', fontSize: '11px', fontWeight: 700, borderRadius: '6px', padding: '4px 10px', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{f.department}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════
   STUDENTS VIEW — real students from Redux
═══════════════════════════════════════════════════════ */
const StudentsView = ({ realStudents = [], onShowProgress }) => {
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filtered = realStudents.filter(s => {
        // Convert the student's values to lowercase/standard casing to ensure comparison works
        // The dropdowns supply code for dept (e.g. 'CSE') and id for year (e.g. '1st Year B.E.')
        const deptMatch = filterDept === 'All' || s.department === filterDept;
        const yearMatch = filterYear === 'All' || s.year === filterYear;
        const searchMatch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
                           (s.email || '').toLowerCase().includes(search.toLowerCase());
                           
        return deptMatch && yearMatch && searchMatch;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterDept, filterYear]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const indexOfLastItem = Math.min(currentPage * itemsPerPage, filtered.length);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const currentItems = filtered.slice(indexOfFirstItem, currentPage * itemsPerPage);

    if (realStudents.length === 0) return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontWeight: 600 }}>No students registered yet.</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Students are added by the Admin from the Admin Panel.</p>
        </div>
    );

    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 18 }}>
                Students <span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>({filtered.length} of {realStudents.length} registered)</span>
            </h2>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none', color: '#333' }}
                />
                <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
                    style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, color: '#333', background: '#fff', cursor: 'pointer' }}>
                    <option value="All">All Years</option>
                    {YEARS.map(y => (
                        <option key={y.id} value={y.id}>{y.label}</option>
                    ))}
                </select>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                    style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, color: '#333', background: '#fff', cursor: 'pointer' }}>
                    <option value="All">All Departments</option>
                    {DEPARTMENTS.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                </select>
            </div>
            
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaf6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(21,101,192,.07)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f0f4ff' }}>
                            {['Student', 'Email', 'Dept/Year', 'Consistency', 'Last Active', 'Activities', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: '#aaa' }}>No students match your filters.</td></tr>
                        ) : currentItems.map((s, i) => (
                            <tr key={s._id} style={{ borderTop: '1px solid #f0f4ff', background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{s.name.charAt(0)}</div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{s.name}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.isOnline ? '#10b981' : '#d1d5db' }} />
                                                <span style={{ fontSize: 10, color: '#888' }}>{s.isOnline ? 'Online' : 'Offline'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>{s.email}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    {s.department && <span style={{ background: '#e8f0fe', color: '#1565c0', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 6px', marginRight: 4 }}>{s.department}</span>}
                                    {s.year && <span style={{ background: '#f3e5f5', color: '#6a1b9a', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 6px' }}>{s.year}</span>}
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 60, height: 5, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ width: `${s.consistencyScore}%`, height: '100%', background: s.consistencyScore > 70 ? '#10b981' : s.consistencyScore > 40 ? '#f59e0b' : '#ef4444' }} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>{s.consistencyScore}%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: 12, color: '#777' }}>{s.lastActive ? new Date(s.lastActive).toLocaleDateString() : '—'}</td>
                                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#555' }}>{s.totalActivities}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <button onClick={() => onShowProgress(s)} style={{ background: '#1565c0', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Review</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbff' }}>
                        <span style={{ fontSize: 13, color: '#555' }}>
                            Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {filtered.length} entries
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: currentPage === 1 ? '#f3f4f6' : '#fff', color: currentPage === 1 ? '#9ca3af' : '#1565c0', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}
                            >
                                Previous
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '0 4px', fontSize: 13, fontWeight: 600, color: '#444' }}>
                                Page {currentPage} of {totalPages}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: currentPage === totalPages ? '#f3f4f6' : '#fff', color: currentPage === totalPages ? '#9ca3af' : '#1565c0', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════
   UPCOMING EXAMS VIEW
═══════════════════════════════════════════════════════ */
const ExamsView = () => (
    <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 18 }}>Upcoming Tests / Exams</h2>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaf6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(21,101,192,.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f0f4ff' }}>
                        {['Subject', 'Date', 'Time', 'Duration', 'Type'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {EXAM_SCHEDULE.map((ex, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #f0f4ff', background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{ex.subject}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#555' }}>{new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#555' }}>{ex.time}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#555' }}>{ex.duration}</td>
                            <td style={{ padding: '12px 16px' }}>
                                <span style={{ background: ex.type === 'Semester' ? '#fce4ec' : '#e8f0fe', color: ex.type === 'Semester' ? '#c62828' : '#1565c0', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' }}>{ex.type}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════
   DOUBT CLARIFICATION VIEW (Staff side)
═══════════════════════════════════════════════════════ */
const DoubtClarificationView = ({ token, currentUser }) => {
    const [threads, setThreads] = useState([]); // unique students who messaged
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingThreads, setLoadingThreads] = useState(true);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const loadThreads = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/api/messages`, config);
            // Group by sender — only messages from students
            const studentMsgs = data.filter(m =>
                m.sender?._id !== currentUser._id &&
                m.sender?.role === 'student'
            );
            const seen = new Set();
            const unique = [];
            studentMsgs.forEach(m => {
                const sid = m.sender._id;
                if (!seen.has(sid)) { seen.add(sid); unique.push(m.sender); }
            });
            setThreads(unique);
        } catch (e) { console.error(e); }
        finally { setLoadingThreads(false); }
    }, [token, currentUser]);

    const loadMessages = useCallback(async (studentId) => {
        try {
            const { data } = await axios.get(`${API}/api/messages?otherUserId=${studentId}`, config);
            setMessages(data);
            // Mark as read
            data.filter(m => !m.isRead && m.recipient._id === currentUser._id)
                .forEach(m => axios.put(`${API}/api/messages/${m._id}/read`, {}, config).catch(() => { }));
        } catch (e) { console.error(e); }
    }, [token, currentUser]);

    useEffect(() => { loadThreads(); }, [loadThreads]);

    useEffect(() => {
        if (selectedStudent) {
            loadMessages(selectedStudent._id);
            const iv = setInterval(() => loadMessages(selectedStudent._id), 10000);
            return () => clearInterval(iv);
        }
    }, [selectedStudent, loadMessages]);

    const sendReply = async () => {
        if (!reply.trim() || !selectedStudent) return;
        setSending(true);
        try {
            await axios.post(`${API}/api/messages`, { recipientId: selectedStudent._id, content: reply.trim() }, config);
            setReply('');
            loadMessages(selectedStudent._id);
        } catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    if (selectedStudent) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
            <button onClick={() => { setSelectedStudent(null); setMessages([]); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1565c0', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}>
                <ArrowLeft size={16} /> Back to Doubts
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, background: '#fff', padding: '14px 18px', borderRadius: 12, border: '1px solid #e8eaf6' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>{selectedStudent.name?.charAt(0)}</div>
                <div>
                    <p style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 15 }}>{selectedStudent.name}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>{selectedStudent.email}</p>
                </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 2px', marginBottom: 16 }}>
                {messages.length === 0 && <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>No messages yet.</p>}
                {messages.map(m => {
                    const isMe = m.sender._id === currentUser._id || m.sender._id?.toString() === currentUser._id?.toString();
                    return (
                        <div key={m._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '70%', background: isMe ? '#1565c0' : '#fff', color: isMe ? '#fff' : '#1a1a2e', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', border: isMe ? 'none' : '1px solid #e8eaf6' }}>
                                <p>{m.content}</p>
                                <p style={{ fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: 'right' }}>{new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    placeholder="Type your reply…"
                    style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none' }}
                />
                <button onClick={sendReply} disabled={sending || !reply.trim()}
                    style={{ background: '#1565c0', color: '#fff', border: 'none', borderRadius: 10, padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, opacity: (sending || !reply.trim()) ? 0.6 : 1 }}>
                    <Send size={15} /> Send
                </button>
            </div>
        </div>
    );

    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>Doubt Clarification</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Student queries sent to you appear here. Click to reply.</p>
            {loadingThreads ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading messages…</div>
            ) : threads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
                    <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ fontWeight: 600 }}>No student doubts yet.</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>When students send you questions, they'll appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {threads.map(s => (
                        <div key={s._id} onClick={() => setSelectedStudent(s)}
                            style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1.5px solid #e8eaf6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1565c0'; e.currentTarget.style.background = '#f0f4ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8eaf6'; e.currentTarget.style.background = '#fff'; }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>{s.name?.charAt(0)}</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{s.name}</p>
                                <p style={{ fontSize: 12, color: '#888' }}>{s.email}</p>
                            </div>
                            <ChevronRight size={18} color="#1565c0" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   Main EducatorDashboard Component
═══════════════════════════════════════════════════════════ */
const EducatorDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [activeNav, setActiveNav] = useState('dashboard');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [viewingProgress, setViewingProgress] = useState(null);
    const [showMessages, setShowMessages] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);       // admin messages
    const [studentMsgCount, setStudentMsgCount] = useState(0); // student messages
    const [targetChatUser, setTargetChatUser] = useState(null);
    const [consistencyData, setConsistencyData] = useState([]);
    const [consistencyScore, setConsistencyScore] = useState(0);

    const { user } = useSelector((state) => state.auth);
    const { students, isStatsLoading } = useSelector((state) => state.educator);

    const totalStudents = students.length || 0;

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    const fetchUnreadCount = async () => {
        try {
            const { data } = await axios.get(`${API}/api/messages/unread-count?senderRole=admin`, config);
            setUnreadCount(data.count);
        } catch (e) { console.error(e); }
    };

    const fetchStudentMsgCount = async () => {
        try {
            const { data } = await axios.get(`${API}/api/messages/unread-count`, config);
            setStudentMsgCount(data.count);
        } catch (e) { console.error(e); }
    };

    const fetchStaffConsistency = async () => {
        try {
            const { data } = await axios.get(`${API}/api/analytics/staff-consistency`, config);
            setConsistencyData(data.weeklyData);
            setConsistencyScore(data.consistencyScore);
        } catch (e) { console.error(e); }
    };

    const sendHeartbeat = async () => {
        try { await axios.post(`${API}/api/auth/heartbeat`, {}, config); }
        catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!user) { navigate('/staff-login'); return; }
        if (user.role !== 'educator' && user.role !== 'admin') { navigate('/'); return; }
        dispatch(getStudentStats());
        fetchUnreadCount();
        fetchStudentMsgCount();
        fetchStaffConsistency();
        sendHeartbeat();
        const countInterval = setInterval(fetchUnreadCount, 30000);
        const studentMsgInterval = setInterval(fetchStudentMsgCount, 20000);
        const consistencyInterval = setInterval(fetchStaffConsistency, 60000);
        const heartbeatInterval = setInterval(sendHeartbeat, 60000);
        return () => { clearInterval(countInterval); clearInterval(studentMsgInterval); clearInterval(consistencyInterval); clearInterval(heartbeatInterval); dispatch(reset()); };
    }, [user, navigate, dispatch]);

    const onLogout = async () => {
        try {
            await axios.post(`${API}/api/auth/logout`, {}, config);
        } catch (e) { console.error('Logout failed', e); }
        dispatch(logout());
        navigate('/staff-login');
    };

    if (isStatsLoading && students.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4ff' }}>
                <div style={{ width: 48, height: 48, border: '4px solid #e8f0fe', borderTopColor: '#1565c0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ marginTop: 16, color: '#4f46e5', fontWeight: 700, fontSize: 18 }}>Loading Dashboard…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeNav) {
            case 'faculties': return <FacultyView token={user?.token} />;
            case 'students': return <StudentsView realStudents={students} onShowProgress={(s) => setViewingProgress(s)} />;
            case 'timetable': return (
                <div style={{ background: '#fff', borderRadius: 16, padding: '24px 26px', border: '1px solid #e8eaf6', boxShadow: '0 2px 12px rgba(21,101,192,.07)' }}>
                    <TimetableView dept={user?.department || 'CSE'} isStaff={true} />
                </div>
            );
            case 'exams': return <ExamsView />;
            case 'assignments': return <EducatorAssignmentsView />;
            case 'doubts': return <DoubtClarificationView token={user?.token} currentUser={user} />;
            default:
                return (
                    <>
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>
                            {[
                                { label: 'Total Students', value: totalStudents, color: '#1565c0', bg: '#e3f2fd' },
                                { label: 'Active Today', value: students.filter(s => s.lastActive && new Date(s.lastActive) > new Date(Date.now() - 86400000)).length, color: '#2e7d32', bg: '#e8f5e9' },
                                { label: 'Avg. Consistency', value: totalStudents > 0 ? Math.round(students.reduce((a, s) => a + (s.consistencyScore || 0), 0) / totalStudents) + '%' : '0%', color: '#e65100', bg: '#fff3e0' },
                            ].map(c => (
                                <div key={c.label} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e8eaf6', boxShadow: '0 2px 12px rgba(21,101,192,.07)', transition: 'transform 0.2s', cursor: 'default' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{c.label}</p>
                                    <p style={{ fontSize: '32px', fontWeight: 800, color: c.color }}>{c.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Activity Summary Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '28px' }}>
                            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8eaf6', boxShadow: '0 2px 12px rgba(21,101,192,.07)', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1565c0' }}>
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Total Students Managed</p>
                                    <p style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{totalStudents}</p>
                                </div>
                            </div>
                            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8eaf6', boxShadow: '0 2px 12px rgba(21,101,192,.07)', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Active Department</p>
                                    <p style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{user?.department || 'General'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Mini Calendar */}
                        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid #e8eaf6', boxShadow: '0 2px 12px rgba(21,101,192,.07)', marginBottom: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calendar size={18} color="#1565c0" /> My Schedule
                                </h3>
                                <button onClick={() => setActiveNav('timetable')} style={{ fontSize: 13, fontWeight: 600, color: '#1565c0', background: '#e8f0fe', border: 'none', borderRadius: 7, padding: '6px 14px', cursor: 'pointer' }}>
                                    Full Timetable →
                                </button>
                            </div>
                            <MiniCalendarWidget staffName={user?.name || 'Staff'} dept={user?.department || 'CSE'} />
                        </div>
                    </>
                );
        }
    };

    return (
        <>
            <style>{`
                *{box-sizing:border-box;margin:0;padding:0;}
                .edu-wrapper{display:flex;min-height:100vh;background:#f0f4ff;font-family:'Inter','Segoe UI',sans-serif;}
                .edu-sidebar{width:210px;min-width:210px;background:#fff;border-right:1px solid #e8eaf6;display:flex;flex-direction:column;min-height:100vh;position:sticky;top:0;height:100vh;overflow-y:auto;}
                .edu-sidebar-logo{padding:20px 20px 14px;border-bottom:1px solid #e8eaf6;display:flex;align-items:center;gap:10px;}
                .edu-logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#1565c0,#42a5f5);border-radius:10px;display:flex;align-items:center;justify-content:center;}
                .edu-logo-text{font-size:17px;font-weight:800;color:#1565c0;letter-spacing:.5px;}
                .edu-nav{flex:1;padding:10px 0;}
                .edu-nav-btn{display:flex;align-items:center;gap:11px;padding:10px 18px;cursor:pointer;color:#666;font-size:14px;font-weight:500;border-left:3px solid transparent;transition:all .15s;background:none;border-top:none;border-right:none;border-bottom:none;width:100%;text-align:left;}
                .edu-nav-btn:hover{background:#e8f0fe;color:#1565c0;}
                .edu-nav-btn.active{color:#1565c0;background:#e8f0fe;border-left:3px solid #1565c0;font-weight:700;}
                .edu-logout-wrap{padding:14px 16px;border-top:1px solid #e8eaf6;}
                .edu-logout-btn{display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:#fdecea;color:#d32f2f;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:background .15s;}
                .edu-logout-btn:hover{background:#ffcdd2;}
                .edu-main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
                .edu-topbar{display:flex;align-items:center;justify-content:space-between;padding:20px 32px;background:#fff;border-bottom:1px solid #e8eaf6;}
                .edu-page-title{font-size:24px;font-weight:800;color:#1565c0;}
                .edu-topbar-right{display:flex;align-items:center;gap:16px;}
                .edu-icon-btn{position:relative;background:none;border:none;cursor:pointer;color:#555;padding:8px;border-radius:50%;transition:background .15s;}
                .edu-icon-btn:hover{background:#f0f4ff;}
                .edu-badge{position:absolute;top:2px;right:2px;background:#e53935;color:#fff;font-size:9px;font-weight:700;width:15px;height:15px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;}
                .edu-avatar{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#1565c0,#42a5f5);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0;}
                .edu-username{font-size:14px;font-weight:600;color:#222;}
                .edu-welcome{padding:20px 32px;background:#fff;border-bottom:1px solid #e8eaf6;}
                .edu-welcome h2{font-size:20px;font-weight:700;color:#333;}
                .edu-welcome span{color:#1565c0;}
                .edu-welcome p{font-size:14px;color:#999;margin-top:4px;}
                .edu-content{flex:1;padding:32px;overflow-y:auto;}
                @media(max-width:900px){.edu-sidebar{width:70px;min-width:70px;}.edu-nav-btn span,.edu-logo-text,.edu-logout-btn span{display:none;}.edu-topbar,.edu-welcome,.edu-content{padding:16px 20px;}}
                @media(max-width:600px){.edu-topbar-right .edu-username{display:none;}}
            `}</style>

            <div className="edu-wrapper">
                {/* SIDEBAR */}
                <aside className="edu-sidebar">
                    <div className="edu-sidebar-logo">
                        <div className="edu-logo-icon"><GraduationCap size={20} color="#fff" /></div>
                        <span className="edu-logo-text">Consistify</span>
                    </div>
                    <nav className="edu-nav">
                        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                            <button key={id} className={`edu-nav-btn${activeNav === id ? ' active' : ''}`} onClick={() => setActiveNav(id)}>
                                <Icon size={17} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="edu-logout-wrap">
                        <button className="edu-logout-btn" onClick={onLogout}>
                            <LogOut size={16} /><span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="edu-main">
                    <header className="edu-topbar">
                        <div>
                            <h1 className="edu-page-title">Welcome, {user?.name?.split(' ')[0] || 'Staff'} 👋</h1>
                            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: 500 }}>Here's what's happening in your institution today.</p>
                        </div>
                        <div className="edu-topbar-right">
                            <button className="edu-icon-btn" onClick={() => { setTargetChatUser(null); setShowMessages(true); }} title="Messages">
                                <Mail size={21} />
                                {unreadCount > 0 && <span className="edu-badge">{unreadCount}</span>}
                            </button>
                            <button className="edu-icon-btn" title="Student Messages" onClick={() => setActiveNav('doubts')}>
                                <Bell size={21} />
                                {studentMsgCount > 0 && <span className="edu-badge">{studentMsgCount}</span>}
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <div className="edu-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'E'}</div>
                                <span className="edu-username">{user?.name || 'Staff'}</span>
                            </div>
                        </div>
                    </header>



                    <div className="edu-content">
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* Modals */}
            {selectedStudent && <FeedbackForm studentId={selectedStudent._id} studentName={selectedStudent.name} onClose={() => setSelectedStudent(null)} />}
            {viewingProgress && <StudentProgressModal studentId={viewingProgress._id} studentName={viewingProgress.name} onClose={() => setViewingProgress(null)} />}
            {showMessages && <MessageListModal onClose={() => { setShowMessages(false); fetchUnreadCount(); }} targetUser={targetChatUser} />}
        </>
    );
};

export default EducatorDashboard;
