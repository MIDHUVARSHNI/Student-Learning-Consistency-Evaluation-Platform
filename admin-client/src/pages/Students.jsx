import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserTable from '../components/UserTable';
import UserModal from '../components/UserModal';
import StudentProgressModal from '../components/StudentProgressModal';
import { useAuth } from '../context/AuthContext';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const { user } = useAuth();

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/admin/students', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setStudents(data);
        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAdd = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setCurrentUser(student);
        setIsModalOpen(true);
    };

    const handleViewProgress = (student) => {
        setSelectedStudent(student);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            toast.success('Student deleted');
            fetchStudents();
        } catch (error) {
            toast.error('Failed to delete student');
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
                toast.success('Student updated');
            } else {
                await axios.post('http://localhost:5001/api/admin/users', formData, config);
                toast.success('Student created');
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div>
            <UserTable
                title="Students"
                role="student"
                users={students}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                onViewProgress={handleViewProgress}
            />
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                user={currentUser}
                role="student"
            />
            {selectedStudent && (
                <StudentProgressModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default Students;
