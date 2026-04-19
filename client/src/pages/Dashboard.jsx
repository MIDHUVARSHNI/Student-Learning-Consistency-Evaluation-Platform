import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import ActivityForm from '../components/ActivityForm';
import ActivityItem from '../components/ActivityItem';
import AnalyticsCard from '../components/AnalyticsCard';
import StudyTrends from '../components/Charts/StudyTrends';
import SubjectDistribution from '../components/Charts/SubjectDistribution';
import Heatmap from '../components/Charts/Heatmap';
import GoalProgress from '../components/GoalProgress';
import TimetableView from '../components/TimetableView';
import { getActivities, reset as resetActivities } from '../slices/activitySlice';
import { getAnalyticsData, reset as resetAnalytics } from '../slices/analyticsSlice';
import WeeklyStudyPlanner from '../components/WeeklyStudyPlanner';
import { logout } from '../slices/authSlice';
import AssignmentsView from '../components/AssignmentsView';
import {
    LogOut, LayoutDashboard, GraduationCap, Calendar, BookOpen,
    FileText, MessageSquare, Bell, ArrowLeft, Send, ChevronRight,
    ClipboardList
} from 'lucide-react';

const API = 'https://student-learning-consistency-evaluation-bij4.onrender.com';

/* ─── Nav items ─── */
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty', label: 'Feedback for Teachers', icon: GraduationCap },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'planner', label: 'Weekly Planner', icon: BookOpen },
    { id: 'exams', label: 'Upcoming Exams', icon: FileText },
    { id: 'doubts', label: 'Doubt Clarification', icon: MessageSquare },
];

/* ════════════════════════════════════════════════
   RATING MODAL
════════════════════════════════════════════════ */
const RatingModal = ({ staff, onClose, token }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            await axios.post(`${API}/api/ratings`, { staffId: staff._id, rating, comment }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onClose();
            alert('Rating submitted successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to submit rating.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '32px', maxWidth: 420, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>Rate {staff.name}</h3>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>Share your honest feedback about this faculty member.</p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
                    {[1, 2, 3, 4, 5].map(num => (
                        <button key={num} onClick={() => setRating(num)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: num <= rating ? '#ffb400' : '#e2e8f0', transform: num === rating ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s' }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        </button>
                    ))}
                </div>

                <textarea
                    placeholder="Write a brief review (optional)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    style={{ width: '100%', minHeight: 100, padding: '14px', borderRadius: 12, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none', marginBottom: 24, fontFamily: 'inherit', resize: 'none' }}
                />

                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e0e7ff', background: '#fff', fontWeight: 700, color: '#666', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={submit} disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: '#1565c0', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(21,101,192,0.3)' }}>
                        {loading ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════
   FACULTY VIEW — real educators from DB
════════════════════════════════════════════════ */
const FacultyView = ({ token }) => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [ratingStaff, setRatingStaff] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        axios.get(`${API}/api/educator/list`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setFaculty(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const filtered = faculty.filter(f =>
        f.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.department?.toLowerCase().includes(search.toLowerCase())
    );

    // Reset to page 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedFaculty = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading faculty…</div>;

    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 16 }}>
                Feedback for Teachers <span style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>({faculty.length} total)</span>
            </h2>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input
                    placeholder="Search by name or department…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, maxWidth: 420, padding: '11px 16px', borderRadius: 10, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none' }}
                />
            </div>
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#aaa' }}>
                    <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ fontWeight: 600 }}>No faculty members found yet.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
                        {paginatedFaculty.map(f => (
                            <div key={f._id} style={{ background: '#fff', borderRadius: 18, padding: '24px', border: '1px solid #e8eaf6', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', gap: 16, alignItems: 'center', transition: 'transform 0.2s' }}>
                                <div style={{ width: 54, height: 54, borderRadius: 16, background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
                                    {f.name?.charAt(0).toUpperCase() || 'F'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 800, fontSize: 15.5, color: '#1a1a2e', marginBottom: 4 }}>{f.name}</p>
                                    {f.department && (
                                        <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '4px 10px', display: 'inline-block' }}>{f.department}</span>
                                    )}
                                </div>
                                <button onClick={() => setRatingStaff(f)} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#f8fafc', color: '#1565c0', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#1565c0'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#1565c0'; }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                    Rate
                                </button>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 24 }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e0e7ff', background: currentPage === 1 ? '#f8fafc' : '#fff', color: currentPage === 1 ? '#a0aec0' : '#1565c0', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                Previous
                            </button>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e0e7ff', background: currentPage === totalPages ? '#f8fafc' : '#fff', color: currentPage === totalPages ? '#a0aec0' : '#1565c0', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
            {ratingStaff && <RatingModal staff={ratingStaff} token={token} onClose={() => setRatingStaff(null)} />}
        </div>
    );
};

/* ════════════════════════════════════════════════
   UPCOMING EXAMS VIEW
════════════════════════════════════════════════ */
const EXAM_SCHEDULE = [
    { subject: 'Data Structures & Algorithms', date: '2026-03-05', time: '10:00 AM', duration: '3 hrs', type: 'Internal' },
    { subject: 'Operating Systems', date: '2026-03-08', time: '10:00 AM', duration: '3 hrs', type: 'Internal' },
    { subject: 'Database Management Systems', date: '2026-03-12', time: '02:00 PM', duration: '3 hrs', type: 'Internal' },
    { subject: 'Computer Networks', date: '2026-03-15', time: '10:00 AM', duration: '3 hrs', type: 'Semester' },
    { subject: 'Software Engineering', date: '2026-03-18', time: '02:00 PM', duration: '3 hrs', type: 'Semester' },
];

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

/* ════════════════════════════════════════════════
   DOUBT CLARIFICATION VIEW (Student side)
════════════════════════════════════════════════ */
const DoubtClarificationView = ({ token, currentUser }) => {
    const [educators, setEducators] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEdu, setSelectedEdu] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [unreadMap, setUnreadMap] = useState({});

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Load educator list
    useEffect(() => {
        axios.get(`${API}/api/educator/list`, config)
            .then(r => setEducators(r.data))
            .catch(console.error);
    }, [token]);

    // Load unread counts by sender
    useEffect(() => {
        axios.get(`${API}/api/messages/unread-counts-by-sender`, config)
            .then(r => setUnreadMap(r.data))
            .catch(console.error);
    }, [token]);

    const loadThread = useCallback(async (eduId) => {
        try {
            const { data } = await axios.get(`${API}/api/messages?otherUserId=${eduId}`, config);
            setMessages(data);
            // Mark unread messages as read
            data.filter(m => !m.isRead && m.recipient?._id?.toString() === currentUser._id?.toString())
                .forEach(m => axios.put(`${API}/api/messages/${m._id}/read`, {}, config).catch(() => { }));
        } catch (e) { console.error(e); }
    }, [token, currentUser]);

    useEffect(() => {
        if (selectedEdu) {
            loadThread(selectedEdu._id);
            const iv = setInterval(() => loadThread(selectedEdu._id), 10000);
            return () => clearInterval(iv);
        }
    }, [selectedEdu, loadThread]);

    const sendMessage = async () => {
        if (!newMsg.trim() || !selectedEdu) return;
        setSending(true);
        try {
            await axios.post(`${API}/api/messages`, { recipientId: selectedEdu._id, content: newMsg.trim() }, config);
            setNewMsg('');
            loadThread(selectedEdu._id);
        } catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    const filteredEducators = educators.filter(edu =>
        edu.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        edu.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedEdu) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
            <button onClick={() => { setSelectedEdu(null); setMessages([]); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1565c0', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
                <ArrowLeft size={16} /> Back to Faculty List
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, background: '#fff', padding: '12px 16px', borderRadius: 12, border: '1px solid #e8eaf6' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                    {selectedEdu.name?.charAt(0)}
                </div>
                <div>
                    <p style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>{selectedEdu.name}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>{selectedEdu.department || 'Staff'}</p>
                </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 2px', marginBottom: 12 }}>
                {messages.length === 0 && (
                    <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40, fontSize: 14 }}>
                        No messages yet. Ask your first question below!
                    </p>
                )}
                {messages.map(m => {
                    const isMe = m.sender._id?.toString() === currentUser._id?.toString() ||
                        m.sender._id === currentUser._id;
                    return (
                        <div key={m._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '72%',
                                background: isMe ? '#1565c0' : '#fff',
                                color: isMe ? '#fff' : '#1a1a2e',
                                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                padding: '10px 14px', fontSize: 13,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                border: isMe ? 'none' : '1px solid #e8eaf6'
                            }}>
                                <p>{m.content}</p>
                                <p style={{ fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: 'right' }}>
                                    {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type your question or doubt…"
                    style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none' }}
                />
                <button onClick={sendMessage} disabled={sending || !newMsg.trim()}
                    style={{ background: '#1565c0', color: '#fff', border: 'none', borderRadius: 10, padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, opacity: (sending || !newMsg.trim()) ? 0.6 : 1 }}>
                    <Send size={15} /> Send
                </button>
            </div>
        </div>
    );

    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>Doubt Clarification</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Select a faculty member to ask your doubts. They'll reply directly.</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input
                    placeholder="Search by name or department…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ flex: 1, maxWidth: 420, padding: '11px 16px', borderRadius: 10, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none' }}
                />
            </div>
            {filteredEducators.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#aaa' }}>
                    <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ fontWeight: 600 }}>{educators.length === 0 ? 'No faculty available yet.' : 'No faculty matched your search.'}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredEducators.map(edu => {
                        const unread = unreadMap[edu._id] || 0;
                        return (
                            <div key={edu._id} onClick={() => setSelectedEdu(edu)}
                                style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1.5px solid #e8eaf6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .15s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1565c0'; e.currentTarget.style.background = '#f0f4ff'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8eaf6'; e.currentTarget.style.background = '#fff'; }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
                                    {edu.name?.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{edu.name}</p>
                                    <p style={{ fontSize: 12, color: '#888' }}>{edu.department || 'Staff'}</p>
                                </div>
                                {unread > 0 && (
                                    <span style={{ background: '#e53935', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {unread}
                                    </span>
                                )}
                                <ChevronRight size={18} color="#1565c0" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════
   MAIN STUDENT DASHBOARD
════════════════════════════════════════════════ */
const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeNav, setActiveNav] = useState('dashboard');
    const [doubtUnread, setDoubtUnread] = useState(0);

    const { user } = useSelector(state => state.auth);
    const { activities, isLoading: activitiesLoading, isError: activitiesError, message: activitiesMessage } = useSelector(state => state.activities);
    const { data: analyticsData, isLoading: analyticsLoading, isError: analyticsError } = useSelector(state => state.analytics);

    useEffect(() => {
        if (activitiesError) console.log(activitiesMessage);
        if (!user) { navigate('/student-login'); return; }
        dispatch(getActivities());
        dispatch(getAnalyticsData());
        return () => { dispatch(resetActivities()); dispatch(resetAnalytics()); };
    }, [user, navigate, activitiesError, activitiesMessage, dispatch]);

    useEffect(() => {
        if (activities.length > 0 || analyticsData) dispatch(getAnalyticsData());
    }, [activities, dispatch]);

    const fetchUnread = () => {
        axios.get(`${API}/api/messages/unread-count`, { headers: { Authorization: `Bearer ${user.token}` } })
            .then(r => setDoubtUnread(r.data.count))
            .catch(() => { });
    };

    const sendHeartbeat = async () => {
        try {
            await axios.post(`${API}/api/auth/heartbeat`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
        } catch (e) { console.error('Heartbeat failed', e); }
    };

    useEffect(() => {
        if (!user?.token) return;
        fetchUnread();
        sendHeartbeat();
        const iv = setInterval(fetchUnread, 30000);
        const hbKv = setInterval(sendHeartbeat, 60000);
        return () => { clearInterval(iv); clearInterval(hbKv); };
    }, [user]);

    const onLogout = async () => {
        try {
            await axios.post(`${API}/api/auth/logout`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
        } catch (e) { console.error('Logout failed', e); }
        dispatch(logout());
        navigate('/student-login');
    };

    if (activitiesLoading && analyticsLoading && !analyticsData) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4ff', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 48, height: 48, border: '4px solid #e8f0fe', borderTopColor: '#1565c0', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                <p style={{ color: '#1565c0', fontWeight: 700, fontSize: 18 }}>Loading your Dashboard…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (activitiesError || analyticsError) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4ff' }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: '40px 48px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>⚠️</p>
                    <h2 style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>Connection Issue</h2>
                    <p style={{ color: '#888', marginBottom: 20 }}>
                        {activitiesMessage || analyticsMessage || "Couldn't reach the server. Make sure the backend is running."}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button onClick={() => { dispatch(getActivities()); dispatch(getAnalyticsData()); }}
                            style={{ background: '#1565c0', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                            Retry
                        </button>
                        <button onClick={onLogout}
                            style={{ background: '#f8d7da', color: '#721c24', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeNav) {
            case 'faculty': return <FacultyView token={user?.token} />;
            case 'timetable': return (
                <div style={{ background: '#fff', borderRadius: 16, padding: '24px 26px', border: '1px solid #e8eaf6', boxShadow: '0 2px 12px rgba(21,101,192,.07)' }}>
                    <TimetableView dept="CSE" />
                </div>
            );
            case 'planner': return <WeeklyStudyPlanner />;
            case 'exams': return <ExamsView />;
            case 'assignments': return <AssignmentsView />;
            case 'doubts': return <DoubtClarificationView token={user?.token} currentUser={user} />;
            default:
                return (
                    <div className="stu-dashboard-grid">
                        {/* Left column – analytics + activities */}
                        <div className="stu-left-content">
                            {analyticsData && (
                                <div className="mb-10 w-full">
                                    {/* Top Cards Container */}
                                    <div className="w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                            <AnalyticsCard data={analyticsData} />
                                            <GoalProgress
                                                currentProgress={analyticsData.goalProgress}
                                                weeklyGoal={analyticsData.weeklyGoal}
                                                currentHours={analyticsData.currentWeekHours}
                                                remainingHours={analyticsData.remainingHours}
                                            />
                                        </div>
                                    </div>

                                    {/* Charts Container */}
                                    <div className="w-full mt-8">
                                        <div className="charts-grid">
                                            <StudyTrends data={analyticsData.weeklyData} />
                                            <SubjectDistribution data={analyticsData.subjectData} />
                                        </div>
                                    </div>

                                    <div className="w-full mt-8">
                                        <Heatmap data={analyticsData.heatmapData} />
                                    </div>
                                </div>
                            )}

                            {/* Feedback Banner Removed */}

                            <section className="stu-recent-activities">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Activity Overview</h2>
                                </div>
                                {activities.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                                        {activities.map(activity => <ActivityItem key={activity._id} activity={activity} />)}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e8eaf6' }}>
                                        <p style={{ color: '#aaa', fontSize: '14px' }}>No activities logged yet.</p>
                                    </div>
                                )}
                            </section>
                        </div>
                        {/* Right column – log activity */}
                        <div className="stu-right-content">
                            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', overflow: 'hidden', position: 'sticky', top: '24px' }}>
                                <div style={{ background: '#2563eb', padding: '16px 20px' }}>
                                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>Log New Activity</h2>
                                </div>
                                <div style={{ padding: '24px 20px', background: '#fff' }}>
                                    <ActivityForm />
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <style>{`
                *{box-sizing:border-box;margin:0;padding:0;}
                .stu-wrapper{display:flex;min-height:100vh;background:#f8f9fc;font-family:'Inter','Segoe UI',sans-serif;}
                .stu-sidebar{width:240px;min-width:240px;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;}
                .stu-sidebar-logo{padding:24px 20px 24px 20px;display:flex;align-items:center;gap:12px;}
                .stu-logo-icon{width:32px;height:32px;background:#2563eb;border-radius:6px;display:flex;align-items:center;justify-content:center;}
                .stu-logo-text{font-size:20px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;}
                .stu-nav{flex:1;padding:12px 0;display:flex;flex-direction:column;gap:6px;}
                .stu-nav-btn{display:flex;align-items:center;gap:12px;padding:12px 16px;margin:0 16px;border-radius:8px;cursor:pointer;color:#6b7280;font-size:14px;font-weight:600;transition:all .2s;background:none;border:none;width:calc(100% - 32px);text-align:left;}
                .stu-nav-btn:hover{background:#f3f4f6;color:#374151;}
                .stu-nav-btn.active{color:#fff;background:#2563eb;font-weight:700;}
                .stu-nav-btn.active svg{stroke:#fff !important;}
                .stu-logout-wrap{padding:16px;border-top:1px solid #e5e7eb;}
                .stu-logout-btn{display:flex;align-items:center;gap:8px;width:100%;padding:10px 14px;background:#fef2f2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:background .15s;}
                .stu-logout-btn:hover{background:#fee2e2;}
                .stu-main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
                .stu-topbar{display:flex;align-items:center;justify-content:space-between;padding:24px 32px;background:#fff;border-bottom:1px solid #e5e7eb;min-height:80px;}
                .stu-page-title{font-size:24px;font-weight:800;color:#111827;letter-spacing:-0.5px;}
                .stu-topbar-right{display:flex;align-items:center;gap:20px;}
                .stu-role-text{font-size:14px;font-weight:600;color:#6b7280;}
                .stu-avatar{width:36px;height:36px;border-radius:10px;background:#2563eb;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;}
                .stu-content{flex:1;padding:32px;overflow-y:auto;}
                .stu-badge{margin-left:auto;background:#e53935;color:#fff;font-size:11px;font-weight:700;padding:2px 6px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
                .charts-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(380px, 1fr));gap:24px;}
                .stu-dashboard-grid{display:grid;grid-template-columns:1fr 340px;gap:32px;align-items:flex-start;}
                .stu-left-content{min-width:0;}
                .section-title{font-size:18px;font-weight:800;color:#111827;margin-bottom:16px;}
                @media(max-width:1250px){
                    .stu-dashboard-grid{grid-template-columns:1fr;gap:32px;}
                    .stu-right-content{order:-1;}
                    .stu-right-content > div{position:static !important;}
                }
                @media(max-width:900px){.stu-sidebar{width:80px;min-width:80px;}.stu-nav-btn span,.stu-logo-text,.stu-logout-btn span,.stu-role-text{display:none;}.stu-nav-btn{justify-content:center;margin:0 12px;width:calc(100% - 24px);}.stu-topbar,.stu-content{padding:16px 20px;}.charts-grid{min-width:0;grid-template-columns:1fr;}}
            `}</style>

            <div className="stu-wrapper">
                {/* SIDEBAR */}
                <aside className="stu-sidebar">
                    <div className="stu-sidebar-logo">
                        <div className="stu-logo-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 22h20L12 2z" /></svg>
                        </div>
                        <span className="stu-logo-text">Consistify</span>
                    </div>
                    <nav className="stu-nav">
                        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                            <button key={id} className={`stu-nav-btn${activeNav === id ? ' active' : ''}`} onClick={() => setActiveNav(id)}>
                                <Icon size={17} />
                                <span>{label}</span>
                                {id === 'doubts' && doubtUnread > 0 && (
                                    <span className="stu-badge">{doubtUnread}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                    <div className="stu-logout-wrap">
                        <button className="stu-logout-btn" onClick={onLogout}>
                            <LogOut size={16} /><span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="stu-main">
                    <header className="stu-topbar">
                        <div>
                            <h1 className="stu-page-title">Welcome, {user?.name?.split(' ')[0] || 'Student'} 👋</h1>
                            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: 500 }}>Here's your learning overview for today.</p>
                        </div>
                    </header>

                    <div className="stu-content">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </>
    );
};

export default Dashboard;
