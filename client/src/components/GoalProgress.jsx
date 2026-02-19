import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../slices/authSlice';
import { getAnalyticsData } from '../slices/analyticsSlice';

const GoalProgress = ({ currentProgress, weeklyGoal, currentHours, remainingHours }) => {
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [newGoal, setNewGoal] = useState(weeklyGoal);

    const handleUpdate = async () => {
        await dispatch(updateProfile({ weeklyGoal: newGoal }));
        dispatch(getAnalyticsData()); // Refresh analytics to reflect new goal calculation
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Weekly Goal</h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-500 hover:text-blue-700 font-semibold"
                >
                    {isEditing ? 'Cancel' : 'Edit Goal'}
                </button>
            </div>

            {isEditing ? (
                <div className="flex items-center space-x-4 mb-4">
                    <input
                        type="number"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        className="border p-2 rounded w-24"
                    />
                    <span className="text-gray-600">hours/week</span>
                    <button
                        onClick={handleUpdate}
                        className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    >
                        Save
                    </button>
                </div>
            ) : (
                <div className="mb-2">
                    <span className="text-2xl font-bold text-gray-800">{currentHours}</span>
                    <span className="text-gray-500"> / {weeklyGoal} hrs</span>
                </div>
            )}

            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${currentProgress}%` }}
                ></div>
            </div>

            <div className="flex justify-between text-sm text-gray-500">
                <span>{currentProgress}% Completed</span>
                <span>{remainingHours > 0 ? `${remainingHours} hrs remaining` : 'Goal Reached! 🎉'}</span>
            </div>
        </div>
    );
};

export default GoalProgress;
