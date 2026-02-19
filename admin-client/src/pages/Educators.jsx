import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserTable from '../components/UserTable';
import UserModal from '../components/UserModal';
import EducatorProgressModal from '../components/EducatorProgressModal';
import MessageModal from '../components/MessageModal';
import { useAuth } from '../context/AuthContext';

const Educators = () => {
    const [educators, setEducators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedEducator, setSelectedEducator] = useState(null);
    const [messageRecipient, setMessageRecipient] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const unreadCountsRef = useRef({});
    const { user } = useAuth();

    const fetchEducators = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/admin/educators', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setEducators(data);
        } catch (error) {
            toast.error('Failed to fetch educators');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCounts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/admin/messages/unread-by-sender', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const countsMap = {};
            let totalUnread = 0;
            data.forEach(item => {
                countsMap[item._id] = item.count;
                totalUnread += item.count;
            });

            // Compare with previous total to show notification
            const prevCounts = unreadCountsRef.current;
            const prevTotal = Object.values(prevCounts).reduce((a, b) => a + b, 0);

            if (totalUnread > prevTotal) {
                toast.success(`You have ${totalUnread - prevTotal} new message${(totalUnread - prevTotal) > 1 ? 's' : ''}!`, {
                    icon: '✉️',
                    duration: 5000,
                    position: 'top-right'
                });
            }

            unreadCountsRef.current = countsMap;
            setUnreadCounts(countsMap);
        } catch (error) {
            console.error('Error fetching unread counts:', error);
        }
    };

    useEffect(() => {
        fetchEducators();
        fetchUnreadCounts();

        const educatorInterval = setInterval(fetchEducators, 60000);
        const unreadInterval = setInterval(fetchUnreadCounts, 10000); // More frequent: 10 seconds

        return () => {
            clearInterval(educatorInterval);
            clearInterval(unreadInterval);
        };
    }, []);

    const handleAdd = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (educator) => {
        setCurrentUser(educator);
        setIsModalOpen(true);
    };

    const handleViewProgress = (educator) => {
        setSelectedEducator(educator);
    };

    const handleMessage = (educator) => {
        setMessageRecipient(educator);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this educator?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            toast.success('Educator deleted');
            fetchEducators();
        } catch (error) {
            toast.error('Failed to delete educator');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            if (currentUser) {
                await axios.put(
                    `http://localhost:5001/api/admin/users/${currentUser._id}`,
                    formData,
                    config
                );
                toast.success('Educator updated');
            } else {
                await axios.post('http://localhost:5001/api/admin/users', formData, config);
                toast.success('Educator created');
            }
            setIsModalOpen(false);
            fetchEducators();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div>
            <UserTable
                title="Educators"
                role="educator"
                users={educators}
                unreadCounts={unreadCounts}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                onViewProgress={handleViewProgress}
                onMessage={handleMessage}
            />
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                user={currentUser}
                role="educator"
            />
            {selectedEducator && (
                <EducatorProgressModal
                    educator={selectedEducator}
                    onClose={() => setSelectedEducator(null)}
                />
            )}
            {messageRecipient && (
                <MessageModal
                    recipient={messageRecipient}
                    onClose={() => {
                        setMessageRecipient(null);
                        fetchUnreadCounts();
                    }}
                />
            )}
        </div>
    );
};

export default Educators;
