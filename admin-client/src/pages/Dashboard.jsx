import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, Building2, BookOpen, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS, SUBJECT_MAP } from '../constants/data';

/* ─── Reusable Modal ─── */
const DetailModal = ({ title, onClose, children }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
    }} onClick={onClose}>
        <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540,
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden'
        }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#fff', flexShrink: 0
            }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{title}</h3>
                <button onClick={onClose} style={{
                    background: '#f3f4f6', border: 'none', borderRadius: '50%',
                    width: 36, height: 36, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#6b7280'
                }}>
                    <X size={18} />
                </button>
            </div>
            {/* Body */}
            <div style={{ overflowY: 'auto', padding: '20px 24px' }}>
                {children}
            </div>
        </div>
    </div>
);

/* ─── Clickable Stat Card ─── */
const StatCard = ({ label, value, icon: Icon, color, bg, onClick, clickable }) => (
    <div style={{
        background: '#fff', borderRadius: 14, padding: '22px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(21,101,192,.07)', border: '1px solid #e8eaf6',
        transition: 'transform .18s, box-shadow .18s',
        cursor: clickable ? 'pointer' : 'default',
        position: 'relative'
    }}
        onClick={onClick}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 22px rgba(21,101,192,.13)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(21,101,192,.07)';
        }}
    >
        <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: '#1a1a2e' }}>{value}</p>

        </div>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={26} color={color} />
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [studentCount, setStudentCount] = useState(0);
    const [educatorCount, setEducatorCount] = useState(0);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [studRes, eduRes] = await Promise.all([
                    axios.get('http://127.0.0.1:5001/api/admin/students', config),
                    axios.get('http://127.0.0.1:5001/api/admin/educators', config),
                ]);
                setStudentCount(studRes.data.length);
                setEducatorCount(eduRes.data.length);
            } catch (err) {
                console.error('Failed to fetch counts', err);
            }
        };
        if (user?.token) {
            fetchCounts();
            const interval = setInterval(fetchCounts, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const displayStudents = studentCount;
    const displayFaculty = educatorCount;
    const displayDept = DEPARTMENTS.length;
    const displaySubjects = Object.values(SUBJECT_MAP).flat().length;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-between w-full">
                    <span className="flex items-center gap-3">
                        <ShieldCheck className="text-blue-600" size={36} />
                        Admin Dashboard
                    </span>
                </h1>
                <p className="text-gray-600 mt-2">Manage your institution's educators and students from a central hub.</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                <Link to="/students?view=all" style={{ textDecoration: 'none', display: 'block' }}>
                    <StatCard label="Total Students" value={displayStudents.toLocaleString()} icon={Users} color="#9c27b0" bg="#f3e5f5" />
                </Link>
                <StatCard label="Total Faculty" value={displayFaculty} icon={GraduationCap} color="#1565c0" bg="#e3f2fd" />
                <StatCard
                    label="Total Departments"
                    value={displayDept}
                    icon={Building2}
                    color="#e91e63"
                    bg="#fce4ec"
                    clickable
                    onClick={() => setShowDeptModal(true)}
                />
                <StatCard
                    label="Total Subjects"
                    value={displaySubjects}
                    icon={BookOpen}
                    color="#388e3c"
                    bg="#e8f5e9"
                    clickable
                    onClick={() => setShowSubjectModal(true)}
                />
            </div>

            {/* Quick Nav Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                <Link
                    to="/educators"
                    className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                    <div className="p-8 flex items-center gap-6">
                        <div className="bg-blue-50 p-4 rounded-2xl group-hover:bg-blue-100 transition-colors duration-300">
                            <GraduationCap size={40} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Educators</h2>
                            <p className="text-gray-500 mt-1">Manage educator accounts, permissions, and details.</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>

                <Link
                    to="/students"
                    className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                    <div className="p-8 flex items-center gap-6">
                        <div className="bg-green-50 p-4 rounded-2xl group-hover:bg-green-100 transition-colors duration-300">
                            <Users size={40} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">Students</h2>
                            <p className="text-gray-500 mt-1">Track student progress, manage profiles, and enrollments.</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
            </div>

            {/* ── Departments Modal ── */}
            {showDeptModal && (
                <DetailModal title={`All Departments (${DEPARTMENTS.length})`} onClose={() => setShowDeptModal(false)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {DEPARTMENTS.map((dept, i) => (
                            <div key={dept.code} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                background: '#f8f9ff', borderRadius: 12,
                                padding: '14px 16px', border: '1px solid #e8eaf6'
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: '#fce4ec', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Building2 size={18} color="#e91e63" />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', margin: 0 }}>{dept.name}</p>
                                    <p style={{ fontSize: 11, color: '#888', fontWeight: 600, margin: '2px 0 0 0' }}>Code: {dept.code}</p>
                                </div>
                                <span style={{
                                    marginLeft: 'auto', background: '#fce4ec', color: '#e91e63',
                                    fontSize: 11, fontWeight: 700, borderRadius: 20,
                                    padding: '3px 10px'
                                }}>
                                    #{i + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </DetailModal>
            )}

            {/* ── Subjects Modal ── */}
            {showSubjectModal && (
                <DetailModal title={`All Subjects (${displaySubjects})`} onClose={() => setShowSubjectModal(false)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {DEPARTMENTS.map(dept => {
                            const subjects = SUBJECT_MAP[dept.code] || [];
                            if (subjects.length === 0) return null;
                            return (
                                <div key={dept.code}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10
                                    }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 8,
                                            background: '#e8f5e9', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <BookOpen size={14} color="#388e3c" />
                                        </div>
                                        <p style={{ fontWeight: 800, fontSize: 13, color: '#1a1a2e', margin: 0 }}>
                                            {dept.name}
                                            <span style={{ fontWeight: 600, color: '#888', fontSize: 12, marginLeft: 6 }}>({dept.code})</span>
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 4 }}>
                                        {subjects.map(sub => (
                                            <span key={sub} style={{
                                                background: '#e8f5e9', color: '#2e7d32',
                                                fontSize: 12, fontWeight: 600,
                                                borderRadius: 20, padding: '5px 14px',
                                                border: '1px solid #c8e6c9'
                                            }}>
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DetailModal>
            )}
        </div>
    );
};

export default Dashboard;
