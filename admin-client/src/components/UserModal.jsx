import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

const UserModal = ({ isOpen, onClose, onSubmit, user, role }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: role,
        weeklyGoal: 10,
        department: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't show password
                role: user.role,
                weeklyGoal: user.weeklyGoal || 10,
                department: user.department || '',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: role,
                weeklyGoal: 10,
                department: '',
            });
        }
    }, [user, role, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {user ? 'Edit User' : `Add New ${role === 'educator' ? 'Educator' : 'Student'}`}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">
                            Password {user && '(Leave blank to keep current)'}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            {...(!user && { required: true })}
                        />
                    </div>

                    {/* Department dropdown — shown for both student and educator */}
                    <div>
                        <label className="block text-gray-700 mb-1">Department</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                        >
                            <option value="">— Select Department —</option>
                            {DEPARTMENTS.map(d => (
                                <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                            ))}
                        </select>
                    </div>

                    {role === 'student' && (
                        <div>
                            <label className="block text-gray-700 mb-1">Weekly Goal</label>
                            <input
                                type="number"
                                name="weeklyGoal"
                                value={formData.weeklyGoal}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {user ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
