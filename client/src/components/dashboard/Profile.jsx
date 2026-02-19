import React, { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';

const Profile = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-md">
                        {user?.name?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                {user?.role?.toUpperCase()}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Personal Info</h3>

                        <div className="group">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                            <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                {user?.name}
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                            <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                {user?.email}
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                            <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                Computer Science (Placeholder)
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Account Settings</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Change Password</label>
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                                />
                                <button className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm mt-2">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
