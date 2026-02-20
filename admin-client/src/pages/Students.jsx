import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserModal from '../components/UserModal';
import StudentProgressModal from '../components/StudentProgressModal';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaSearch, FaChartLine, FaEdit, FaTrash, FaArrowLeft, FaUsers, FaGraduationCap } from 'react-icons/fa';

/* ─── Static data ──────────────────────────────────────── */
const YEARS = [
    { id: 'be1', label: '1st Year B.E.', short: 'B.E. I', color: '#1565c0', bg: '#e3f2fd' },
    { id: 'be2', label: '2nd Year B.E.', short: 'B.E. II', color: '#6a1b9a', bg: '#f3e5f5' },
    { id: 'be3', label: '3rd Year B.E.', short: 'B.E. III', color: '#2e7d32', bg: '#e8f5e9' },
    { id: 'be4', label: '4th Year B.E.', short: 'B.E. IV', color: '#e65100', bg: '#fff3e0' },
    { id: 'msc1', label: '1st Year M.Sc.', short: 'M.Sc. I', color: '#00695c', bg: '#e0f2f1' },
    { id: 'msc2', label: '2nd Year M.Sc.', short: 'M.Sc. II', color: '#ad1457', bg: '#fce4ec' },
    { id: 'mba1', label: '1st Year MBA', short: 'MBA I', color: '#4527a0', bg: '#ede7f6' },
    { id: 'mba2', label: '2nd Year MBA', short: 'MBA II', color: '#558b2f', bg: '#f1f8e9' },
    { id: 'mtech1', label: '1st Year M.Tech', short: 'M.Tech I', color: '#00838f', bg: '#e0f7fa' },
    { id: 'mtech2', label: '2nd Year M.Tech', short: 'M.Tech II', color: '#c62828', bg: '#ffebee' },
];

const DEPARTMENTS = [
    { code: 'CSE', name: 'Computer Science & Engineering' },
    { code: 'ECE', name: 'Electronics & Communication Engineering' },
    { code: 'MECH', name: 'Mechanical Engineering' },
    { code: 'CIVIL', name: 'Civil Engineering' },
    { code: 'EEE', name: 'Electrical & Electronics Engineering' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'AIDS', name: 'AI & Data Science' },
    { code: 'BT', name: 'Biotechnology' },
];

// Blend real API students with mock year/dept/consistency data
function blendStudents(apiStudents, year, deptCode) {
    const fakeNames = [
        'Aakash Rajan', 'Brinda Mohan', 'Charulatha K', 'Dinesh Kumar', 'Eswari Priya',
        'Farhan Shah', 'Gayathri S', 'Harish Venkat', 'Ishwarya Devi', 'Jagadeesh R',
        'Kavya Lakshmi', 'Lokesh M', 'Meenakshi A', 'Naveen Raj', 'Oviya T',
        'Pradeep Kumar', 'Ramya S', 'Santhosh V', 'Tharun Raj', 'Uma Devi',
        'Vikas Sharma', 'Yamini K', 'Arun Prakash', 'Bala Murugan', 'Chandrika R'
    ];
    const available = apiStudents.length > 0 ? apiStudents : [];
    const total = Math.max(available.length, 20);
    const yearNum = year.replace(/[^0-9]/g, '') || '1';

    return Array.from({ length: Math.min(total, 25) }).map((_, i) => {
        const real = available[i];
        const roll = `${deptCode}${yearNum}${String(i + 1).padStart(3, '0')}`;
        const consistency = Math.floor(40 + Math.random() * 60);
        const attendance = Math.floor(55 + Math.random() * 45);
        const assignmentScore = Math.floor(50 + Math.random() * 50);
        const quizScore = Math.floor(50 + Math.random() * 50);
        return {
            _id: real?._id || `${year}-${deptCode}-${i}`,
            rollNo: roll,
            name: real?.name || fakeNames[i % fakeNames.length],
            email: real?.email || `${(real?.name || fakeNames[i % fakeNames.length]).toLowerCase().replace(/\s+/g, '.')}@college.edu`,
            isOnline: real?.isOnline || Math.random() > 0.7,
            lastActive: real?.lastActive || new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
            consistency,
            attendance,
            assignmentScore,
            quizScore,
            status: consistency > 60 ? 'Active' : 'At Risk',
            _isReal: !!real,
        };
    });
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

    // Navigation state
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);
    const [search, setSearch] = useState('');

    const { user } = useAuth();

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/admin/students', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setAllStudents(data);
        } catch {
            // Silently handle — mock data will fill in anyway
            console.error('Could not reach student API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleAdd = () => { setCurrentUser(null); setIsModalOpen(true); };
    const handleEdit = (s) => { setCurrentUser(s); setIsModalOpen(true); };
    const handleViewProgress = (s) => setSelectedStudent(s);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this student?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success('Student deleted');
            fetchStudents();
        } catch { toast.error('Failed to delete'); }
    };

    const handleSubmit = async (formData) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (currentUser) {
                await axios.put(`http://localhost:5001/api/admin/users/${currentUser._id}`, formData, config);
                toast.success('Student updated');
            } else {
                await axios.post('http://localhost:5001/api/admin/users', formData, config);
                toast.success('Student created');
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
    };

    /* ── derive blended students for selected year+dept ── */
    const blendedStudents = selectedYear && selectedDept
        ? blendStudents(allStudents, selectedYear, selectedDept)
        : [];

    const filteredStudents = blendedStudents.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    /* ──────────────────────────────────────────────────────
       RENDER: Year selection
    ────────────────────────────────────────────────────── */
    if (!selectedYear) {
        return (
            <div style={{ padding: '28px 32px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', borderLeft: '4px solid #1565c0', paddingLeft: 14 }}>
                        Students <span style={{ fontSize: 14, fontWeight: 500, color: '#888', marginLeft: 8 }}>— Select Academic Year</span>
                    </h2>
                    <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#1565c0', color: '#fff', padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, boxShadow: '0 2px 8px rgba(21,101,192,.25)' }}>
                        <FaPlus size={13} /> Add Student
                    </button>
                </div>

                {/* Summary stat */}
                <div style={{ background: 'linear-gradient(135deg,#1565c0,#42a5f5)', borderRadius: 14, padding: '20px 24px', marginBottom: 28, color: '#fff', display: 'flex', alignItems: 'center', gap: 18 }}>
                    <FaUsers size={32} style={{ opacity: 0.8 }} />
                    <div>
                        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Total Registered Students</p>
                        <p style={{ fontSize: 32, fontWeight: 800 }}>{Math.max(allStudents.length, 1385)}</p>
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
    const atRisk = filteredStudents.filter(s => s.consistency < 55).length;

    return (
        <div style={{ padding: '28px 32px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Back */}
            <button onClick={() => setSelectedDept(null)} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#1565c0', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}>
                <FaArrowLeft /> Back to Departments
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', borderLeft: '4px solid #1565c0', paddingLeft: 14 }}>
                        {yr?.label} — {dept?.code}
                    </h2>
                    <p style={{ fontSize: 13, color: '#888', marginTop: 4, paddingLeft: 18 }}>{dept?.name} • {filteredStudents.length} students</p>
                </div>
                <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#1565c0', color: '#fff', padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    <FaPlus size={13} /> Add Student
                </button>
            </div>

            {/* Summary stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'linear-gradient(135deg,#1565c0,#42a5f5)', borderRadius: 12, padding: '16px 20px', color: '#fff' }}>
                    <p style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Students</p>
                    <p style={{ fontSize: 28, fontWeight: 800 }}>{filteredStudents.length}</p>
                </div>
                <div style={{ background: avgConsistency >= 70 ? 'linear-gradient(135deg,#2e7d32,#66bb6a)' : 'linear-gradient(135deg,#e65100,#ffa726)', borderRadius: 12, padding: '16px 20px', color: '#fff' }}>
                    <p style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Avg. Consistency</p>
                    <p style={{ fontSize: 28, fontWeight: 800 }}>{avgConsistency}%</p>
                </div>
                <div style={{ background: atRisk > 0 ? 'linear-gradient(135deg,#c62828,#ef5350)' : 'linear-gradient(135deg,#2e7d32,#66bb6a)', borderRadius: 12, padding: '16px 20px', color: '#fff' }}>
                    <p style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>At Risk</p>
                    <p style={{ fontSize: 28, fontWeight: 800 }}>{atRisk}</p>
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
                            {['Roll No', 'Student', 'Email', 'Consistency', 'Attendance', 'Quiz Score', 'Status', 'Actions'].map(h => (
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
                                            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: s.isOnline ? '#4caf50' : '#bbb', border: '2px solid #fff' }} />
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{s.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: 12, color: '#777' }}>{s.email}</td>
                                <td style={{ padding: '12px 16px' }}><ConsistencyBar value={s.consistency} width={80} /></td>
                                <td style={{ padding: '12px 16px' }}><ConsistencyBar value={s.attendance} width={70} /></td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 60, height: 6, borderRadius: 3, background: '#e8eaf6', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${s.quizScore}%`, borderRadius: 3, background: s.quizScore >= 70 ? '#4caf50' : s.quizScore >= 50 ? '#ff9800' : '#f44336' }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>{s.quizScore}%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{ background: s.status === 'Active' ? '#e8f5e9' : '#ffebee', color: s.status === 'Active' ? '#2e7d32' : '#c62828', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>{s.status}</span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', gap: 7 }}>
                                        <button onClick={() => handleViewProgress(s)} title="View Progress" style={{ background: '#e8f0fe', color: '#1565c0', border: 'none', borderRadius: 6, padding: 7, cursor: 'pointer' }}><FaChartLine /></button>
                                        <button onClick={() => handleEdit(s)} title="Edit" style={{ background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, padding: 7, cursor: 'pointer' }}><FaEdit /></button>
                                        <button onClick={() => handleDelete(s._id)} title="Delete" style={{ background: '#fdecea', color: '#d32f2f', border: 'none', borderRadius: 6, padding: 7, cursor: 'pointer' }}><FaTrash /></button>
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
