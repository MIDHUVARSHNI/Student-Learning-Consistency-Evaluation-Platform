import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserModal from '../components/UserModal';
import StudentProgressModal from '../components/StudentProgressModal';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaSearch, FaChartLine, FaEdit, FaTrash, FaArrowLeft, FaUsers, FaGraduationCap } from 'react-icons/fa';

/* ─── Static data ──────────────────────────────────────── */
import { DEPARTMENTS, YEARS } from '../constants/data';

// Blend real API students with mock year/dept data.
// Real students start with consistency 0 until analytics are fetched.
// Mock/filler students permanently show 0 (they haven't used the platform).
// Help sort and filter students from the API.
function processStudents(apiStudents, year, deptCode) {
    let filtered = apiStudents;
    if (year && year !== 'all') {
        filtered = filtered.filter(s => s.year === year);
    }
    if (deptCode && deptCode !== 'all') {
        filtered = filtered.filter(s => s.department === deptCode);
    }

    return filtered
        .sort((a, b) => {
            // Sort alphabetically by name
            const nameCompare = a.name.localeCompare(b.name);
            if (nameCompare !== 0) return nameCompare;
            // If names are identical, sort by roll number
            return (a.rollNo || '').localeCompare(b.rollNo || '');
        })
        .map(s => ({
            ...s,
            consistency: 0,
            attendance: 0,
            assignmentScore: 0,
            quizScore: 0,
            status: 'Not Started',
            _isReal: true,
            _analyticsLoading: true
        }));
}

/* ─── Consistency bar component ─────────────────────────── */
const ConsistencyBar = ({ value, width = 80 }) => {
    const color = value >= 75 ? '#2e7d32' : value >= 55 ? '#e65100' : '#c62828';
    const bg = value >= 75 ? '#e8f5e9' : value >= 55 ? '#fff3e0' : '#ffebee';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width, height: 7, borderRadius: 4, background: '#e8eaf6', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${value}%`, borderRadius: 4, background: color, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 34 }}>{value}%</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   Main Students Component
═══════════════════════════════════════════════════════════ */
const Students = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [processedStudents, setProcessedStudents] = useState([]);

    // Navigation state
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);
    const [search, setSearch] = useState('');

    const { user } = useAuth();
    const location = useLocation();
    const queryView = new URLSearchParams(location.search).get('view');
    const [isGlobalView, setIsGlobalView] = useState(false);

    useEffect(() => {
        if (queryView === 'all') {
            setIsGlobalView(true);
            setSelectedYear('all');
            setSelectedDept('all');
        }
    }, [queryView]);

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('http://127.0.0.1:5001/api/admin/students', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setAllStudents(data);
        } catch {
            console.error('Could not reach student API');
        } finally {
            setLoading(false);
        }
    };

    // Fetch real analytics for each real student and update consistency scores
    const fetchRealConsistency = async (students) => {
        const realStudents = students.filter(s => s._isReal);
        if (realStudents.length === 0) return;

        const updates = await Promise.allSettled(
            realStudents.map(s =>
                axios.get(`http://127.0.0.1:5001/api/admin/students/${s._id}/analytics`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                }).then(res => ({ _id: s._id, score: res.data.consistencyScore ?? 0 }))
                    .catch(() => ({ _id: s._id, score: 0 }))
            )
        );

        const scoreMap = {};
        updates.forEach(r => {
            if (r.status === 'fulfilled') scoreMap[r.value._id] = r.value.score;
        });

        setProcessedStudents(prev =>
            prev.map(s =>
                s._isReal && scoreMap[s._id] !== undefined
                    ? {
                        ...s,
                        consistency: scoreMap[s._id],
                        attendance: s.attendance,
                        _analyticsLoading: false,
                    }
                    : { ...s, _analyticsLoading: false }
            )
        );
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleAdd = () => { setCurrentUser(null); setIsModalOpen(true); };
    const handleEdit = (s) => { setCurrentUser(s); setIsModalOpen(true); };
    const handleViewProgress = (s) => setSelectedStudent(s);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this student?')) return;
        try {
            await axios.delete(`http://127.0.0.1:5001/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success('Student deleted');
            fetchStudents();
        } catch { toast.error('Failed to delete'); }
    };

    const handleSubmit = async (formData) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (currentUser) {
                await axios.put(`http://127.0.0.1:5001/api/admin/users/${currentUser._id}`, formData, config);
                toast.success('Student updated');
            } else {
                await axios.post('http://127.0.0.1:5001/api/admin/users', formData, config);
                toast.success('Student created');
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
    };

    /* ── Rebuild processed list when year/dept/allStudents change ── */
    useEffect(() => {
        if (isGlobalView || (selectedYear && selectedDept)) {
            const initial = processStudents(allStudents, selectedYear, selectedDept);
            setProcessedStudents(initial);
            fetchRealConsistency(initial);
        } else {
            setProcessedStudents([]);
        }
    }, [selectedYear, selectedDept, allStudents, isGlobalView]);

    const filteredStudents = processedStudents.filter(s =>
        (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.rollNo || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(search.toLowerCase())
    );

    /* ──────────────────────────────────────────────────────
       RENDER: Year selection
    ────────────────────────────────────────────────────── */
    if (!selectedYear && !isGlobalView) {
        return (
            <div style={{ padding: '28px 32px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', borderLeft: '4px solid #1565c0', paddingLeft: 14 }}>
                        Students <span style={{ fontSize: 14, fontWeight: 500, color: '#888', marginLeft: 8 }}>— Select Academic Year</span>
                    </h2>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setIsGlobalView(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', color: '#1565c0', padding: '9px 18px', borderRadius: 8, border: '1.5px solid #1565c0', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                            View All Students
                        </button>
                        <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#1565c0', color: '#fff', padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, boxShadow: '0 2px 8px rgba(21,101,192,.25)' }}>
                            <FaPlus size={13} /> Add Student
                        </button>
                    </div>
                </div>

                {/* Summary stat */}
                <div style={{ background: 'linear-gradient(135deg,#1565c0,#42a5f5)', borderRadius: 14, padding: '20px 24px', marginBottom: 28, color: '#fff', display: 'flex', alignItems: 'center', gap: 18 }}>
                    <FaUsers size={32} style={{ opacity: 0.8 }} />
                    <div>
                        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Total Registered Students</p>
                        <p style={{ fontSize: 32, fontWeight: 800 }}>{allStudents.length}</p>
                    </div>
                </div>

                <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Click an academic year to browse students by department and view their learning consistency.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
                    {YEARS.map(yr => (
                        <div key={yr.id} onClick={() => setSelectedYear(yr.id)}
                            style={{ background: '#fff', borderRadius: 14, padding: '22px 20px', border: `1.5px solid #e8eaf6`, cursor: 'pointer', boxShadow: '0 2px 10px rgba(21,101,192,.07)', transition: 'all .18s', textAlign: 'center' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = yr.color; e.currentTarget.style.boxShadow = '0 8px 24px rgba(21,101,192,.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#e8eaf6'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(21,101,192,.07)'; }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: yr.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: `2px solid ${yr.color}22` }}>
                                <FaGraduationCap size={22} color={yr.color} />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 4 }}>{yr.label}</p>
                            <span style={{ background: yr.bg, color: yr.color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' }}>{yr.short}</span>
                        </div>
                    ))}
                </div>

                {/* Modals */}
                <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} user={currentUser} role="student" />
            </div>
        );
    }

    /* ──────────────────────────────────────────────────────
       RENDER: Department selection
    ────────────────────────────────────────────────────── */
    if (!selectedDept) {
        const yr = YEARS.find(y => y.id === selectedYear);
        return (
            <div style={{ padding: '28px 32px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
                <button onClick={() => setSelectedYear(null)} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#1565c0', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 22 }}>
                    <FaArrowLeft /> Back to Year Selection
                </button>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', borderLeft: '4px solid #1565c0', paddingLeft: 14, marginBottom: 8 }}>
                    {yr?.label}
                </h2>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Select a department to view students and their learning consistency.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                    {DEPARTMENTS.map(dept => (
                        <div key={dept.code} onClick={() => setSelectedDept(dept.code)}
                            style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1.5px solid #e8eaf6', cursor: 'pointer', boxShadow: '0 2px 10px rgba(21,101,192,.07)', transition: 'all .18s', display: 'flex', alignItems: 'center', gap: 16 }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1565c0'; e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8eaf6'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = ''; }}>
                            <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{dept.code}</div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{dept.name}</p>
                                <p style={{ fontSize: 11, color: '#1565c0', marginTop: 4, fontWeight: 600 }}>View Students →</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ──────────────────────────────────────────────────────
       RENDER: Student list with consistency
    ────────────────────────────────────────────────────── */
    const yr = YEARS.find(y => y.id === selectedYear);
    const dept = DEPARTMENTS.find(d => d.code === selectedDept);

    const avgConsistency = filteredStudents.length > 0
        ? Math.round(filteredStudents.reduce((s, st) => s + st.consistency, 0) / filteredStudents.length)
        : 0;

    return (
        <div style={{ padding: '28px 32px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Back */}
            <button onClick={() => { setSelectedDept(null); setSelectedYear(null); setIsGlobalView(false); }} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#1565c0', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}>
                <FaArrowLeft /> Back to {isGlobalView ? 'Selection' : 'Departments'}
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', borderLeft: '4px solid #1565c0', paddingLeft: 14 }}>
                        {isGlobalView ? 'All Registered Students' : `${yr?.label} — ${dept?.code}`}
                    </h2>
                    <p style={{ fontSize: 13, color: '#888', marginTop: 4, paddingLeft: 18 }}>
                        {isGlobalView ? 'Comprehensive Institutional List' : `${dept?.name} • ${filteredStudents.length} students`}
                    </p>
                </div>
                <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#1565c0', color: '#fff', padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    <FaPlus size={13} /> Add Student
                </button>
            </div>

            {/* Summary stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'linear-gradient(135deg,#1565c0,#42a5f5)', borderRadius: 12, padding: '16px 20px', color: '#fff' }}>
                    <p style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Students</p>
                    <p style={{ fontSize: 28, fontWeight: 800 }}>{filteredStudents.length}</p>
                </div>
                <div style={{ background: avgConsistency >= 70 ? 'linear-gradient(135deg,#2e7d32,#66bb6a)' : 'linear-gradient(135deg,#e65100,#ffa726)', borderRadius: 12, padding: '16px 20px', color: '#fff' }}>
                    <p style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Avg. Consistency</p>
                    <p style={{ fontSize: 28, fontWeight: 800 }}>{avgConsistency}%</p>
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
                <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }} />
                <input placeholder="Search by name, roll no, email…" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none', color: '#333' }} />
            </div>

            {/* Student table */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaf6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(21,101,192,.07)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f0f4ff' }}>
                            {['Roll No', 'Student', 'Email', isGlobalView && 'Dept', 'Consistency', isGlobalView && 'Year', 'Actions'].filter(Boolean).map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((s, i) => (
                            <tr key={s._id} style={{ borderTop: '1px solid #f0f4ff', background: i % 2 === 0 ? '#fff' : '#fafbff', transition: 'background .15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f5f7ff'}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbff'}>
                                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1565c0', whiteSpace: 'nowrap' }}>{s.rollNo}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.name.charAt(0)}</div>
                                            {(() => {
                                                const isTrulyOnline = s.lastActive && (new Date() - new Date(s.lastActive)) < 300000;
                                                return (
                                                    <span
                                                        title={s.lastActive ? `Last active: ${new Date(s.lastActive).toLocaleString()}` : 'Never active'}
                                                        style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: isTrulyOnline ? '#4caf50' : '#bbb', border: '2px solid #fff' }}
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{s.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: 12, color: '#777' }}>{s.email}</td>
                                {isGlobalView && (
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ background: '#e8f0fe', color: '#1565c0', fontSize: 10, fontWeight: 700, borderRadius: 5, padding: '2px 7px' }}>{s.department || 'N/A'}</span>
                                    </td>
                                )}
                                <td style={{ padding: '12px 16px' }}>
                                    {s._analyticsLoading
                                        ? <span style={{ fontSize: 12, color: '#aaa' }}>Loading…</span>
                                        : <ConsistencyBar value={s.consistency} width={80} />}
                                </td>
                                {isGlobalView && (
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ background: '#f3e5f5', color: '#6a1b9a', fontSize: 10, fontWeight: 700, borderRadius: 5, padding: '2px 7px' }}>
                                            {YEARS.find(y => y.id === s.year)?.label || s.year || 'N/A'}
                                        </span>
                                    </td>
                                )}

                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button
                                            onClick={() => handleEdit(s)}
                                            style={{ color: '#1565c0', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                            title="Edit Student"
                                        >
                                            <FaEdit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s._id)}
                                            style={{ color: '#c62828', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                            title="Delete Student"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleViewProgress(s)}
                                            style={{ color: '#2e7d32', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                            title="View Analytics"
                                        >
                                            <FaChartLine size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr><td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: '#aaa' }}>No students found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} user={currentUser} role="student" />
            {selectedStudent && <StudentProgressModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
        </div>
    );
};

export default Students;
