import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserModal from '../components/UserModal';
import EducatorProgressModal from '../components/EducatorProgressModal';
import MessageModal from '../components/MessageModal';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaEnvelope, FaChartLine, FaSearch, FaThLarge, FaList, FaArrowLeft } from 'react-icons/fa';
import { DEPARTMENTS, SUBJECT_MAP } from '../constants/data';

// Static dept info matched to API educators
const DEPT_MAP = DEPARTMENTS.reduce((acc, d) => ({ ...acc, [d.code]: d.name }), {});

const DESIG = ['Professor', 'Associate Professor', 'Assistant Professor', 'Professor & HOD'];

// Enrich each educator from API with dept/subject/designation display info
function enrichEducator(edu, index) {
    const deptKeys = Object.keys(DEPT_MAP);
    const dept = edu.department || deptKeys[index % deptKeys.length];

    // Only show Active if the educator has explicitly logged in (isOnline=true)
    // AND was seen within the last 5 minutes
    const isActuallyOnline =
        edu.isOnline === true &&
        edu.lastActive &&
        (new Date() - new Date(edu.lastActive)) < 300000;

    return {
        ...edu,
        dept,
        deptFull: DEPT_MAP[dept] || dept,
        subjects: SUBJECT_MAP[dept] || [],
        designation: DESIG[index % DESIG.length],
        experience: `${(index % 15) + 3} yrs`,
        isOnline: isActuallyOnline,
    };
}

const Educators = () => {
    const [educators, setEducators] = useState([]);
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
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchEducators = async () => {
        try {
            const { data } = await axios.get('http://127.0.0.1:5001/api/admin/educators', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setEducators(data.map((e, i) => enrichEducator(e, i)));
        } catch (err) {
            console.error('Error fetching educators:', err);
            toast.error('Failed to load educators');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCounts = async () => {
        try {
            const { data } = await axios.get('http://127.0.0.1:5001/api/admin/messages/unread-by-sender', {
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
        const ei = setInterval(fetchEducators, 30000);
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
            await axios.delete(`http://127.0.0.1:5001/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success('Educator deleted');
            fetchEducators();
        } catch { toast.error('Failed to delete'); }
    };

    const handleSubmit = async (formData) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (currentUser) {
                await axios.put(`http://127.0.0.1:5001/api/admin/users/${currentUser._id}`, formData, config);
                toast.success('Educator updated');
            } else {
                await axios.post('http://127.0.0.1:5001/api/admin/users', formData, config);
                toast.success('Educator created');
            }
            setIsModalOpen(false);
            fetchEducators();
        } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
    };

    const depts = ['All', ...Object.keys(DEPT_MAP)];
    const filtered = educators.filter(e =>
        (filterDept === 'All' || e.dept === filterDept) &&
        (e.name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase()) || e.dept?.toLowerCase().includes(search.toLowerCase()))
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterDept]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const indexOfLastItem = Math.min(currentPage * itemsPerPage, filtered.length);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const currentItems = filtered.slice(indexOfFirstItem, currentPage * itemsPerPage);

    return (
        <div style={{ padding: '28px 32px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Back to Dashboard */}
            <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#1565c0', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}>
                <FaArrowLeft /> Back to Dashboard
            </button>
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
                    {currentItems.map((edu, i) => (
                        <div key={edu._id} style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e8eaf6', boxShadow: '0 2px 10px rgba(21,101,192,.07)', display: 'flex', flexDirection: 'column' }}>
                            {/* Top info */}
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                                    {edu.name?.charAt(0).toUpperCase() || 'E'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{edu.name}</p>
                                    <p style={{ fontSize: 12, color: '#888', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{edu.email}</p>
                                    <p style={{ fontSize: 11.5, color: '#1565c0', fontWeight: 600 }}>{edu.dept} • {edu.designation}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                                    <span style={{
                                        background: edu.isOnline ? '#e8f5e9' : '#fff1f0',
                                        color: edu.isOnline ? '#2e7d32' : '#f5222d',
                                        fontSize: 10,
                                        fontWeight: 800,
                                        borderRadius: 20,
                                        padding: '3px 10px',
                                        border: `1px solid ${edu.isOnline ? '#c8e6c9' : '#ffa39e'}`,
                                        textTransform: 'uppercase'
                                    }}>
                                        {edu.isOnline ? 'Active' : 'Offline'}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f0f4ff', paddingTop: 12, marginTop: 'auto' }}>
                                <button onClick={() => handleViewProgress(edu)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#e8f0fe', color: '#1565c0', border: 'none', borderRadius: 7, padding: '7px 0', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                                    <FaChartLine /> Progress
                                </button>
                                <button onClick={() => handleMessage(edu)} style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                                    <FaEnvelope />
                                    {unreadCounts[edu._id] > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#e53935', color: '#fff', fontSize: 9, fontWeight: 700, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{unreadCounts[edu._id]}</span>}
                                </button>
                                <button onClick={() => handleEdit(edu)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(edu._id)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdecea', color: '#d32f2f', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
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
                                {['Faculty', 'Email', 'Dept', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((edu, i) => (
                                <tr key={edu._id} style={{ borderTop: '1px solid #f0f4ff', background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1565c0,#42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{edu.name?.charAt(0).toUpperCase()}</div>
                                            <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{edu.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>{edu.email}</td>
                                    <td style={{ padding: '12px 16px' }}><span style={{ background: '#e8f0fe', color: '#1565c0', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 9px' }}>{edu.dept}</span></td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            background: edu.isOnline ? '#e8f5e9' : '#fff1f0',
                                            color: edu.isOnline ? '#2e7d32' : '#f5222d',
                                            fontSize: 11,
                                            fontWeight: 800,
                                            borderRadius: 20,
                                            padding: '4px 12px',
                                            border: `1px solid ${edu.isOnline ? '#c8e6c9' : '#ffa39e'}`,
                                            textTransform: 'uppercase'
                                        }}>
                                            {edu.isOnline ? 'Active' : 'Offline'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: 7 }}>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ marginTop: 24, padding: '16px 24px', borderRadius: 14, border: '1px solid #e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 10px rgba(21,101,192,.07)' }}>
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

            {/* Modals */}
            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} user={currentUser} role="educator" />
            {selectedEducator && <EducatorProgressModal educator={selectedEducator} onClose={() => setSelectedEducator(null)} />}
            {messageRecipient && <MessageModal recipient={messageRecipient} onClose={() => { setMessageRecipient(null); fetchUnreadCounts(); }} />}
        </div>
    );
};

export default Educators;
