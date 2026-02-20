import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getStudentStats, reset } from '../slices/educatorSlice';
import { logout } from '../slices/authSlice';
import {
    LogOut, MessageSquare, TrendingUp, Mail, Bell,
    LayoutDashboard, Users, Building2, BookOpen,
    Calendar, Video, GraduationCap,
    FileText, Star, UserCog, ChevronRight,
    ChevronDown, ArrowLeft
} from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';
import StudentProgressModal from '../components/StudentProgressModal';
import MessageListModal from '../components/MessageListModal';
import TimetableView from '../components/TimetableView';
import MiniCalendarWidget from '../components/MiniCalendarWidget';

/* ─── Engineering College Data ─────────────────────────── */
const DEPARTMENTS = [
    {
        id: 'cse', name: 'Computer Science & Engineering', code: 'CSE',
        subjects: ['Data Structures & Algorithms', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'Software Engineering', 'Artificial Intelligence', 'Machine Learning', 'Web Technologies', 'Compiler Design', 'Theory of Computation']
    },
    {
        id: 'ece', name: 'Electronics & Communication Engineering', code: 'ECE',
        subjects: ['Circuit Theory', 'Electronic Devices', 'Digital Electronics', 'Signals & Systems', 'Analog Communication', 'Digital Communication', 'VLSI Design', 'Microprocessors', 'Antenna Theory', 'Embedded Systems']
    },
    {
        id: 'mech', name: 'Mechanical Engineering', code: 'MECH',
        subjects: ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Manufacturing Technology', 'Machine Design', 'Heat Transfer', 'CAD/CAM', 'Robotics', 'Automobile Engineering', 'Industrial Engineering']
    },
    {
        id: 'civil', name: 'Civil Engineering', code: 'CIVIL',
        subjects: ['Structural Analysis', 'Fluid Mechanics', 'Soil Mechanics', 'Surveying', 'Transportation Engineering', 'Environmental Engineering', 'Concrete Technology', 'Estimation & Costing', 'Hydraulics', 'Foundation Engineering']
    },
    {
        id: 'eee', name: 'Electrical & Electronics Engineering', code: 'EEE',
        subjects: ['Electrical Circuits', 'Electromagnetic Theory', 'Electrical Machines', 'Power Systems', 'Control Systems', 'Power Electronics', 'Switchgear & Protection', 'High Voltage Engineering', 'Renewable Energy', 'Smart Grid']
    },
    {
        id: 'it', name: 'Information Technology', code: 'IT',
        subjects: ['Programming in C', 'Data Structures', 'Object Oriented Programming', 'Computer Architecture', 'Network Security', 'Cloud Computing', 'Mobile Application Development', 'Big Data Analytics', 'IoT Systems', 'Cyber Security']
    },
    {
        id: 'ai', name: 'Artificial Intelligence & Data Science', code: 'AIDS',
        subjects: ['Python Programming', 'Statistics for Data Science', 'Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Data Visualization', 'Big Data Technologies', 'Reinforcement Learning', 'AI Ethics']
    },
    {
        id: 'biotech', name: 'Biotechnology', code: 'BT',
        subjects: ['Cell Biology', 'Microbiology', 'Biochemistry', 'Molecular Biology', 'Genetic Engineering', 'Bioprocess Engineering', 'Immunology', 'Bioinformatics', 'Fermentation Technology', 'Protein Engineering']
    },
];

const FACULTY_LIST = [
    { id: 1, name: 'Dr. Meena Rajendran', dept: 'CSE', designation: 'Professor', subjects: ['Data Structures & Algorithms', 'Theory of Computation'], experience: '14 yrs', students: 120 },
    { id: 2, name: 'Prof. Suresh Kumar', dept: 'ECE', designation: 'Associate Professor', subjects: ['Digital Communication', 'Signals & Systems'], experience: '10 yrs', students: 95 },
    { id: 3, name: 'Dr. Latha Krishnan', dept: 'MECH', designation: 'Professor', subjects: ['Thermodynamics', 'Fluid Mechanics'], experience: '18 yrs', students: 80 },
    { id: 4, name: 'Mr. Arun Pandian', dept: 'CIVIL', designation: 'Assistant Professor', subjects: ['Structural Analysis', 'Concrete Technology'], experience: '6 yrs', students: 70 },
    { id: 5, name: 'Dr. Priya Venkat', dept: 'EEE', designation: 'Associate Professor', subjects: ['Power Systems', 'Control Systems'], experience: '12 yrs', students: 88 },
    { id: 6, name: 'Ms. Kavitha Nair', dept: 'IT', designation: 'Assistant Professor', subjects: ['Cloud Computing', 'Network Security'], experience: '5 yrs', students: 110 },
    { id: 7, name: 'Dr. Ramesh Babu', dept: 'CSE', designation: 'Professor & HOD', subjects: ['Artificial Intelligence', 'Machine Learning'], experience: '20 yrs', students: 150 },
    { id: 8, name: 'Mr. Vijay Shankar', dept: 'AIDS', designation: 'Assistant Professor', subjects: ['Deep Learning', 'Computer Vision'], experience: '4 yrs', students: 90 },
    { id: 9, name: 'Dr. Nalini Devi', dept: 'BT', designation: 'Professor', subjects: ['Genetic Engineering', 'Molecular Biology'], experience: '16 yrs', students: 60 },
    { id: 10, name: 'Prof. Karthik Raja', dept: 'ECE', designation: 'Professor & HOD', subjects: ['VLSI Design', 'Embedded Systems'], experience: '15 yrs', students: 105 },
];

const YEARS = [
    { id: 'be1', label: '1st Year B.E.', short: 'B.E. I' },
    { id: 'be2', label: '2nd Year B.E.', short: 'B.E. II' },
    { id: 'be3', label: '3rd Year B.E.', short: 'B.E. III' },
    { id: 'be4', label: '4th Year B.E.', short: 'B.E. IV' },
    { id: 'msc1', label: '1st Year M.Sc.', short: 'M.Sc. I' },
    { id: 'msc2', label: '2nd Year M.Sc.', short: 'M.Sc. II' },
    { id: 'mba1', label: '1st Year MBA', short: 'MBA I' },
    { id: 'mba2', label: '2nd Year MBA', short: 'MBA II' },
    { id: 'mtech1', label: '1st Year M.Tech', short: 'M.Tech I' },
    { id: 'mtech2', label: '2nd Year M.Tech', short: 'M.Tech II' },
];

// Generate mock students for each year+dept combination
const generateStudents = (year, deptCode) => {
    const names = ['Aakash Rajan', 'Brinda Mohan', 'Charulatha K', 'Dinesh Kumar', 'Eswari Priya', 'Farhan Shah', 'Gayathri S', 'Harish Venkat', 'Ishwarya Devi', 'Jagadeesh R', 'Kavya Lakshmi', 'Lokesh M', 'Meenakshi A', 'Naveen Raj', 'Oviya T'];
    return names.slice(0, 10 + Math.floor(Math.random() * 5)).map((name, i) => ({
        id: `${year}-${deptCode}-${i}`,
        rollNo: `${deptCode}${year.replace(/[^0-9]/g, '')}${String(i + 1).padStart(3, '0')}`,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@college.edu`,
        attendance: Math.floor(65 + Math.random() * 35),
        cgpa: (6 + Math.random() * 4).toFixed(2),
        status: Math.random() > 0.15 ? 'Active' : 'Inactive',
    }));
};



/* ─── Sidebar navigation items ─────────────────────────── */
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculties', label: 'Faculties', icon: GraduationCap },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'lectures', label: 'Lectures', icon: Video },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'exams', label: 'Exams', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'users', label: 'Users', icon: UserCog },
];



/* ═══════════════════════════════════════════════════════
   FACULTY VIEW
═══════════════════════════════════════════════════════ */
const FacultyView = () => {
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const depts = ['All', ...Array.from(new Set(FACULTY_LIST.map(f => f.dept)))];
    const filtered = FACULTY_LIST.filter(f =>
        (filterDept === 'All' || f.dept === filterDept) &&
        (f.name.toLowerCase().includes(search.toLowerCase()) || f.dept.toLowerCase().includes(search.toLowerCase()))
    );
    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 18 }}>Faculty List</h2>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                    placeholder="Search faculty or department…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none', color: '#333' }}
                />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                    style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, color: '#333', background: '#fff', cursor: 'pointer' }}>
                    {depts.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {filtered.map(f => (
                    <div key={f.id} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e8eaf6', boxShadow: '0 2px 10px rgba(21,101,192,.06)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                            {f.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 2 }}>{f.name}</p>
                            <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{f.designation} • {f.dept} • {f.experience}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {f.subjects.map(s => (
                                    <span key={s} style={{ background: '#e8f0fe', color: '#1565c0', fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 9px' }}>{s}</span>
                                ))}
                            </div>
                            <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>👥 {f.students} Students</p>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p style={{ color: '#aaa', padding: 20 }}>No faculty found.</p>}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════
   DEPARTMENTS VIEW
═══════════════════════════════════════════════════════ */
const DepartmentsView = () => {
    const [selectedDept, setSelectedDept] = useState(null);
    if (selectedDept) {
        const dept = DEPARTMENTS.find(d => d.id === selectedDept);
        return (
            <div>
                <button onClick={() => setSelectedDept(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1565c0', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 18 }}>
                    <ArrowLeft size={16} /> Back to Departments
                </button>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>{dept.name}</h2>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 22 }}>Code: {dept.code} • {dept.subjects.length} Subjects</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                    {dept.subjects.map((sub, i) => (
                        <div key={sub} style={{ background: '#fff', border: '1.5px solid #e8eaf6', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 6px rgba(21,101,192,.06)' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1565c0', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                {i + 1}
                            </div>
                            <p style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 18 }}>Departments</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {DEPARTMENTS.map(dept => (
                    <div key={dept.id}
                        onClick={() => setSelectedDept(dept.id)}
                        style={{ background: '#fff', borderRadius: 14, padding: '22px 22px', border: '1.5px solid #e8eaf6', boxShadow: '0 2px 10px rgba(21,101,192,.07)', cursor: 'pointer', transition: 'transform .18s,box-shadow .18s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(21,101,192,.14)'; e.currentTarget.style.borderColor = '#1565c0'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(21,101,192,.07)'; e.currentTarget.style.borderColor = '#e8eaf6'; }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{dept.code}</div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 14.5, color: '#1a1a2e', lineHeight: 1.3 }}>{dept.name}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ background: '#e8f0fe', color: '#1565c0', fontSize: 12, fontWeight: 600, borderRadius: 6, padding: '3px 10px' }}>{dept.subjects.length} Subjects</span>
                            <span style={{ color: '#1565c0', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>View <ChevronRight size={14} /></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════
   STUDENTS VIEW
═══════════════════════════════════════════════════════ */
const StudentsView = ({ realStudents = [] }) => {
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);

    const mockStudents = selectedYear && selectedDept ? generateStudents(selectedYear, selectedDept) : [];
    const studentsToShow = realStudents.length > 0 && !selectedYear ? realStudents : mockStudents;

    if (selectedYear && selectedDept) {
        const deptName = DEPARTMENTS.find(d => d.code === selectedDept)?.name || selectedDept;
        const yearLabel = YEARS.find(y => y.id === selectedYear)?.label || selectedYear;
        return (
            <div>
                <button onClick={() => setSelectedDept(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1565c0', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 18 }}>
                    <ArrowLeft size={16} /> Back to Departments
                </button>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Students — {yearLabel} / {deptName}</h2>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 22 }}>{mockStudents.length} students enrolled</p>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaf6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(21,101,192,.07)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f0f4ff' }}>
                                {['Roll No', 'Name', 'Email', 'Attendance', 'CGPA', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {mockStudents.map((s, i) => (
                                <tr key={s.id} style={{ borderTop: '1px solid #f0f4ff', background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1565c0' }}>{s.rollNo}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{s.name}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#777' }}>{s.email}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 60, height: 6, borderRadius: 3, background: '#e8eaf6', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${s.attendance}%`, borderRadius: 3, background: s.attendance >= 75 ? '#4caf50' : s.attendance >= 60 ? '#ff9800' : '#f44336' }} />
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: s.attendance >= 75 ? '#388e3c' : s.attendance >= 60 ? '#e65100' : '#c62828' }}>{s.attendance}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#333' }}>{s.cgpa}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ background: s.status === 'Active' ? '#e8f5e9' : '#fce4ec', color: s.status === 'Active' ? '#2e7d32' : '#c62828', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' }}>{s.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (selectedYear) {
        const yearLabel = YEARS.find(y => y.id === selectedYear)?.label || selectedYear;
        return (
            <div>
                <button onClick={() => setSelectedYear(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1565c0', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 18 }}>
                    <ArrowLeft size={16} /> Back to Year Selection
                </button>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>Select Department — {yearLabel}</h2>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 22 }}>Choose a department to view students</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                    {DEPARTMENTS.map(dept => (
                        <div key={dept.id} onClick={() => setSelectedDept(dept.code)}
                            style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1.5px solid #e8eaf6', cursor: 'pointer', boxShadow: '0 1px 8px rgba(21,101,192,.06)', transition: 'all .18s', display: 'flex', alignItems: 'center', gap: 14 }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1565c0'; e.currentTarget.style.background = '#f0f4ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8eaf6'; e.currentTarget.style.background = '#fff'; }}>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{dept.code}</div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 13.5, color: '#1a1a2e' }}>{dept.name}</p>
                                <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{dept.subjects.length} Subjects</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>Students</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 22 }}>Select the academic year to view student list</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {YEARS.map(year => (
                    <div key={year.id} onClick={() => setSelectedYear(year.id)}
                        style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1.5px solid #e8eaf6', cursor: 'pointer', boxShadow: '0 2px 10px rgba(21,101,192,.07)', transition: 'all .18s', textAlign: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#1565c0'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(21,101,192,.14)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#e8eaf6'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(21,101,192,.07)'; }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff', fontWeight: 800, fontSize: 13 }}>{year.short}</div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{year.label}</p>
                        <p style={{ fontSize: 11, color: '#1565c0', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>View Students <ChevronRight size={12} /></p>
                    </div>
                ))}
            </div>
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
    const [unreadCount, setUnreadCount] = useState(0);
    const [studentUnreadCounts, setStudentUnreadCounts] = useState({});
    const [targetChatUser, setTargetChatUser] = useState(null);


    const { user } = useSelector((state) => state.auth);
    const { students, isStatsLoading } = useSelector((state) => state.educator);

    const totalStudents = students.length || 0;

    const fetchUnreadCount = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/messages/unread-count?senderRole=admin', config);
            setUnreadCount(data.count);
        } catch (e) { console.error(e); }
    };

    const fetchPerStudentUnreadCounts = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/messages/unread-counts-by-sender', config);
            setStudentUnreadCounts(data);
        } catch (e) { console.error(e); }
    };

    const sendHeartbeat = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/auth/heartbeat', {}, config);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'educator' && user.role !== 'admin') { navigate('/'); return; }
        dispatch(getStudentStats());
        fetchUnreadCount();
        fetchPerStudentUnreadCounts();
        sendHeartbeat();
        const countInterval = setInterval(() => { fetchUnreadCount(); fetchPerStudentUnreadCounts(); }, 30000);
        const heartbeatInterval = setInterval(sendHeartbeat, 60000);
        return () => { clearInterval(countInterval); clearInterval(heartbeatInterval); dispatch(reset()); };
    }, [user, navigate, dispatch]);

    const onLogout = () => { dispatch(logout()); navigate('/login'); };



    if (isStatsLoading && students.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4ff' }}>
                <div style={{ width: 48, height: 48, border: '4px solid #e8f0fe', borderTopColor: '#1565c0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ marginTop: 16, color: '#4f46e5', fontWeight: 700, fontSize: 18 }}>Loading Dashboard…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    /* ── render content based on active nav ── */
    const renderContent = () => {
        switch (activeNav) {
            case 'faculties': return <FacultyView />;
            case 'departments': return <DepartmentsView />;
            case 'students': return <StudentsView realStudents={students} />;
            case 'timetable': return (
                <div style={{ background: '#fff', borderRadius: 16, padding: '24px 26px', border: '1px solid #e8eaf6', boxShadow: '0 2px 12px rgba(21,101,192,.07)' }}>
                    <TimetableView staffName={user?.name || 'Staff'} dept={user?.department || 'CSE'} />
                </div>
            );
            default:
                return (
                    <>
                        {/* ── Mini Calendar ── */}
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
                .edu-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 28px 10px;background:#fff;border-bottom:1px solid #e8eaf6;}
                .edu-page-title{font-size:24px;font-weight:800;color:#1565c0;}
                .edu-topbar-right{display:flex;align-items:center;gap:14px;}
                .edu-icon-btn{position:relative;background:none;border:none;cursor:pointer;color:#555;padding:7px;border-radius:50%;transition:background .15s;}
                .edu-icon-btn:hover{background:#f0f4ff;}
                .edu-badge{position:absolute;top:2px;right:2px;background:#e53935;color:#fff;font-size:9px;font-weight:700;width:15px;height:15px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;}
                .edu-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1565c0,#42a5f5);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;flex-shrink:0;}
                .edu-username{font-size:14px;font-weight:600;color:#222;}
                .edu-welcome{padding:16px 28px 10px;background:#fff;border-bottom:1px solid #e8eaf6;}
                .edu-welcome h2{font-size:19px;font-weight:700;color:#333;}
                .edu-welcome span{color:#1565c0;}
                .edu-welcome p{font-size:12.5px;color:#999;margin-top:3px;}
                .edu-content{flex:1;padding:24px 28px;overflow-y:auto;}
                @media(max-width:1100px){
                  .edu-stats-grid{grid-template-columns:repeat(2,1fr)!important;}
                  .edu-lectures-grid{grid-template-columns:1fr!important;}
                }
                @media(max-width:700px){.edu-sidebar{width:58px;min-width:58px;}.edu-nav-btn span,.edu-logo-text,.edu-logout-btn span{display:none;}.edu-content{padding:14px;}}
            `}</style>

            <div className="edu-wrapper">
                {/* SIDEBAR */}
                <aside className="edu-sidebar">
                    <div className="edu-sidebar-logo">
                        <div className="edu-logo-icon">
                            <GraduationCap size={20} color="#fff" />
                        </div>
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
                    {/* Top bar */}
                    <header className="edu-topbar">
                        <h1 className="edu-page-title">Educator Dashboard</h1>
                        <div className="edu-topbar-right">
                            <button className="edu-icon-btn" onClick={() => { setTargetChatUser(null); setShowMessages(true); }} title="Messages">
                                <Mail size={21} />
                                {unreadCount > 0 && <span className="edu-badge">{unreadCount}</span>}
                            </button>
                            <button className="edu-icon-btn" title="Notifications"><Bell size={21} /></button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <div className="edu-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'E'}</div>
                                <span className="edu-username">{user?.name || 'Educator'}</span>
                            </div>
                        </div>
                    </header>

                    {/* Welcome */}
                    <div className="edu-welcome">
                        <h2>Welcome, <span>{user?.name || 'Staff'}</span> 👋</h2>
                        <p>Here's what's happening in your institution today.</p>
                    </div>

                    {/* Content */}
                    <div className="edu-content">
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* Modals */}
            {selectedStudent && <FeedbackForm studentId={selectedStudent._id} studentName={selectedStudent.name} onClose={() => setSelectedStudent(null)} />}
            {viewingProgress && <StudentProgressModal studentId={viewingProgress._id} studentName={viewingProgress.name} onClose={() => setViewingProgress(null)} />}
            {showMessages && <MessageListModal onClose={() => { setShowMessages(false); fetchUnreadCount(); fetchPerStudentUnreadCounts(); }} targetUser={targetChatUser} />}
        </>
    );
};

export default EducatorDashboard;
