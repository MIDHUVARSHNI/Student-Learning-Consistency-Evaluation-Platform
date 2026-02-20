import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserModal from '../components/UserModal';
import EducatorProgressModal from '../components/EducatorProgressModal';
import MessageModal from '../components/MessageModal';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaEnvelope, FaChartLine, FaSearch, FaThLarge, FaList } from 'react-icons/fa';

// Static dept info matched to API educators
const DEPT_MAP = {
    'CSE': 'Computer Science & Engineering',
    'ECE': 'Electronics & Communication',
    'MECH': 'Mechanical Engineering',
    'CIVIL': 'Civil Engineering',
    'EEE': 'Electrical & Electronics',
    'IT': 'Information Technology',
    'AIDS': 'AI & Data Science',
    'BT': 'Biotechnology',
};

const SUBJECT_MAP = {
    'CSE': ['Data Structures', 'Algorithms', 'OS', 'DBMS', 'AI/ML'],
    'ECE': ['Digital Electronics', 'Signals & Systems', 'VLSI', 'Embedded Systems'],
    'MECH': ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing'],
    'CIVIL': ['Structural Analysis', 'Surveying', 'Concrete Technology'],
    'EEE': ['Power Systems', 'Control Systems', 'Power Electronics'],
    'IT': ['Cloud Computing', 'Network Security', 'Mobile Apps'],
    'AIDS': ['Machine Learning', 'Deep Learning', 'NLP'],
    'BT': ['Molecular Biology', 'Genetic Engineering', 'Bioinformatics'],
};

const DESIG = ['Professor', 'Associate Professor', 'Assistant Professor', 'Professor & HOD'];

const MOCK_NAMES = [
    'Dr. Meena Rajendran', 'Prof. Suresh Kumar', 'Dr. Latha Krishnan', 'Mr. Arun Pandian',
    'Dr. Priya Venkat', 'Ms. Kavitha Nair', 'Dr. Ramesh Babu', 'Mr. Vijay Shankar',
    'Dr. Nalini Devi', 'Prof. Karthik Raja', 'Dr. Anitha Kumari', 'Prof. Mohan Das',
    'Dr. Saranya Iyer', 'Mr. Deepak Raj', 'Dr. Revathi Sundaram', 'Prof. Ganesh Murthy',
    'Dr. Bhavani Shankar', 'Ms. Divya Lakshmi', 'Dr. Senthil Nathan', 'Prof. Varun Krishnan',
    'Dr. Janani Priya', 'Mr. Hari Prasad', 'Dr. Sowmya Devi', 'Prof. Rajesh Kumar',
    'Dr. Padma Priya', 'Mr. Karthikeyan S', 'Dr. Vimala Rani', 'Prof. Aravind Kumar',
    'Dr. Lakshmi Narayanan', 'Ms. Swetha Reddy', 'Dr. Gopal Krishna', 'Prof. Nithya Kalyani',
    'Dr. Sathish Kumar', 'Mr. Balaji S', 'Dr. Uma Maheswari', 'Prof. Venkatesh R',
    'Dr. Gayathri Devi', 'Ms. Preethi Mohan', 'Dr. Mahesh Babu', 'Prof. Sangeetha K',
    'Dr. Ravi Shankar', 'Mr. Ashwin Kumar', 'Dr. Indira Devi', 'Prof. Sundar Rajan',
    'Dr. Kamala Devi', 'Ms. Nandini S', 'Dr. Srinivasan R', 'Prof. Lakshmi Priya',
];

// Enrich each educator from API with mock dept/subject/designation
function enrichEducator(edu, index) {
    const deptKeys = Object.keys(DEPT_MAP);
    const dept = deptKeys[index % deptKeys.length];
    return {
        ...edu,
        dept,
        deptFull: DEPT_MAP[dept],
        subjects: SUBJECT_MAP[dept] || [],
        designation: DESIG[index % DESIG.length],
        experience: `${(index % 15) + 3} yrs`,
    };
}

// Generate mock educators to fill up to TARGET_COUNT
function generateMockEducators(apiEducators, targetCount = 50) {
    const enrichedApi = apiEducators.map((e, i) => enrichEducator(e, i));
    const mockCount = Math.max(0, targetCount - enrichedApi.length);
    const deptKeys = Object.keys(DEPT_MAP);
    const mocks = [];
    for (let i = 0; i < mockCount; i++) {
        const idx = enrichedApi.length + i;
        const dept = deptKeys[idx % deptKeys.length];
        mocks.push({
            _id: `mock-edu-${i}`,
            name: MOCK_NAMES[i % MOCK_NAMES.length],
            email: `${MOCK_NAMES[i % MOCK_NAMES.length].toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.')}@college.edu`,
            isOnline: Math.random() > 0.6,
            dept,
            deptFull: DEPT_MAP[dept],
            subjects: SUBJECT_MAP[dept] || [],
            designation: DESIG[idx % DESIG.length],
            experience: `${(idx % 15) + 3} yrs`,
            _isMock: true,
        });
    }
    return [...enrichedApi, ...mocks];
}

const Educators = () => {
    const [educators, setEducators] = useState([]);
    const [enriched, setEnriched] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedEducator, setSelectedEducator] = useState(null);
    const [messageRecipient, setMessageRecipient] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
    const unreadCountsRef = useRef({});
    const { user } = useAuth();

    const fetchEducators = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/admin/educators', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setEducators(data);
            setEnriched(generateMockEducators(data, 50));
        } catch {
            // If API is unreachable, still show mock educators
            setEnriched(generateMockEducators([], 50));
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCounts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/admin/messages/unread-by-sender', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const map = {};
            let total = 0;
            data.forEach(item => { map[item._id] = item.count; total += item.count; });
            const prev = Object.values(unreadCountsRef.current).reduce((a, b) => a + b, 0);
            if (total > prev) toast.success(`${total - prev} new message${total - prev > 1 ? 's' : ''}!`, { icon: '✉️', duration: 5000 });
            unreadCountsRef.current = map;
            setUnreadCounts(map);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchEducators();
        fetchUnreadCounts();
        const ei = setInterval(fetchEducators, 60000);
        const ui = setInterval(fetchUnreadCounts, 10000);
        return () => { clearInterval(ei); clearInterval(ui); };
    }, []);

    const handleAdd = () => { setCurrentUser(null); setIsModalOpen(true); };
    const handleEdit = (edu) => { setCurrentUser(edu); setIsModalOpen(true); };
    const handleViewProgress = (edu) => setSelectedEducator(edu);
    const handleMessage = (edu) => setMessageRecipient(edu);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this educator?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success('Educator deleted');
            fetchEducators();
        } catch { toast.error('Failed to delete'); }
    };

    const handleSubmit = async (formData) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (currentUser) {
                await axios.put(`http://localhost:5001/api/admin/users/${currentUser._id}`, formData, config);
                toast.success('Educator updated');
            } else {
                await axios.post('http://localhost:5001/api/admin/users', formData, config);
                toast.success('Educator created');
            }
            setIsModalOpen(false);
            fetchEducators();
        } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
    };

    const depts = ['All', ...Object.keys(DEPT_MAP)];
    const filtered = enriched.filter(e =>
        (filterDept === 'All' || e.dept === filterDept) &&
        (e.name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase()) || e.dept?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ padding: '28px 32px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', borderLeft: '4px solid #1565c0', paddingLeft: 14 }}>
                    Faculty / Educators <span style={{ fontSize: 14, fontWeight: 500, color: '#888', marginLeft: 8 }}>({filtered.length})</span>
                </h2>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* View toggle */}
                    <div style={{ display: 'flex', border: '1.5px solid #e0e7ff', borderRadius: 8, overflow: 'hidden' }}>
                        <button onClick={() => setViewMode('cards')} style={{ padding: '7px 14px', background: viewMode === 'cards' ? '#1565c0' : '#fff', color: viewMode === 'cards' ? '#fff' : '#555', border: 'none', cursor: 'pointer', fontSize: 13 }} title="Card View"><FaThLarge /></button>
                        <button onClick={() => setViewMode('table')} style={{ padding: '7px 14px', background: viewMode === 'table' ? '#1565c0' : '#fff', color: viewMode === 'table' ? '#fff' : '#555', border: 'none', cursor: 'pointer', fontSize: 13 }} title="Table View"><FaList /></button>
                    </div>
                    <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#1565c0', color: '#fff', padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, boxShadow: '0 2px 8px rgba(21,101,192,.25)' }}>
                        <FaPlus size={13} /> Add Educator
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }} />
                    <input placeholder="Search by name, email or dept…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none', color: '#333' }} />
                </div>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                    style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: 14, color: '#333', background: '#fff', cursor: 'pointer' }}>
                    {depts.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading educators…</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>No educators found.</div>
            ) : viewMode === 'cards' ? (
                /* ── CARD VIEW ── */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
                    {filtered.map((edu, i) => (
                        <div key={edu._id} style={{ background: '#fff', borderRadius: 14, padding: '20px 20px 16px', border: '1px solid #e8eaf6', boxShadow: '0 2px 10px rgba(21,101,192,.07)', display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {/* Top row */}
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                                    {edu.name?.charAt(0).toUpperCase() || 'E'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{edu.name}</p>
                                    <p style={{ fontSize: 12, color: '#888', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{edu.email}</p>
                                    <p style={{ fontSize: 11.5, color: '#1565c0', fontWeight: 600 }}>{edu.designation} • {edu.dept} • {edu.experience}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                    <span style={{ background: edu.isOnline ? '#e8f5e9' : '#f5f5f5', color: edu.isOnline ? '#2e7d32' : '#999', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 9px', textAlign: 'center' }}>
                                        {edu.isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                                {edu.subjects.map(s => (
                                    <span key={s} style={{ background: '#e8f0fe', color: '#1565c0', fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 8px' }}>{s}</span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f0f4ff', paddingTop: 12 }}>
                                <button onClick={() => handleViewProgress(edu)} title="View Progress"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#e8f0fe', color: '#1565c0', border: 'none', borderRadius: 7, padding: '7px 0', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                                    <FaChartLine /> Progress
                                </button>
                                <button onClick={() => handleMessage(edu)} title="Message" style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                                    <FaEnvelope />
                                    {unreadCounts[edu._id] > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#e53935', color: '#fff', fontSize: 9, fontWeight: 700, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{unreadCounts[edu._id]}</span>}
                                </button>
                                <button onClick={() => handleEdit(edu)} title="Edit" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(edu._id)} title="Delete" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdecea', color: '#d32f2f', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* ── TABLE VIEW ── */
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaf6', overflow: 'hidden', boxShadow: '0 2px 10px rgba(21,101,192,.07)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f0f4ff' }}>
                                {['Faculty', 'Email', 'Dept', 'Designation', 'Subjects', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((edu, i) => (
                                <tr key={edu._id} style={{ borderTop: '1px solid #f0f4ff', background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{edu.name?.charAt(0).toUpperCase()}</div>
                                            <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{edu.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>{edu.email}</td>
                                    <td style={{ padding: '12px 16px' }}><span style={{ background: '#e8f0fe', color: '#1565c0', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 9px' }}>{edu.dept}</span></td>
                                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#555' }}>{edu.designation}</td>
                                    <td style={{ padding: '12px 16px', maxWidth: 180 }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {edu.subjects.slice(0, 2).map(s => <span key={s} style={{ background: '#f0f4ff', color: '#1565c0', fontSize: 10, fontWeight: 600, borderRadius: 5, padding: '2px 7px' }}>{s}</span>)}
                                            {edu.subjects.length > 2 && <span style={{ fontSize: 10, color: '#888' }}>+{edu.subjects.length - 2} more</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}><span style={{ background: edu.isOnline ? '#e8f5e9' : '#f5f5f5', color: edu.isOnline ? '#2e7d32' : '#999', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' }}>{edu.isOnline ? 'Online' : 'Offline'}</span></td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                                            <button onClick={() => handleViewProgress(edu)} style={{ background: '#e8f0fe', color: '#1565c0', border: 'none', borderRadius: 6, padding: 7, cursor: 'pointer' }} title="Progress"><FaChartLine /></button>
                                            <button onClick={() => handleMessage(edu)} style={{ position: 'relative', background: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: 6, padding: 7, cursor: 'pointer' }} title="Message">
                                                <FaEnvelope />
                                                {unreadCounts[edu._id] > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#e53935', color: '#fff', fontSize: 9, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{unreadCounts[edu._id]}</span>}
                                            </button>
                                            <button onClick={() => handleEdit(edu)} style={{ background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, padding: 7, cursor: 'pointer' }} title="Edit"><FaEdit /></button>
                                            <button onClick={() => handleDelete(edu._id)} style={{ background: '#fdecea', color: '#d32f2f', border: 'none', borderRadius: 6, padding: 7, cursor: 'pointer' }} title="Delete"><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} user={currentUser} role="educator" />
            {selectedEducator && <EducatorProgressModal educator={selectedEducator} onClose={() => setSelectedEducator(null)} />}
            {messageRecipient && <MessageModal recipient={messageRecipient} onClose={() => { setMessageRecipient(null); fetchUnreadCounts(); }} />}
        </div>
    );
};

export default Educators;
