import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../slices/authSlice';
import { getAnalyticsData } from '../slices/analyticsSlice';
import { Target, Edit2 } from 'lucide-react';

const GoalProgress = ({ currentProgress, weeklyGoal, currentHours, remainingHours }) => {
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [newGoal, setNewGoal] = useState(weeklyGoal);

    const handleUpdate = async () => {
        await dispatch(updateProfile({ weeklyGoal: newGoal }));
        dispatch(getAnalyticsData());
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col relative min-h-[145px] w-full group">
            <div className="flex justify-between items-start mb-2">
                <p className="text-[#6b7280] text-[11px] font-bold uppercase tracking-wider text-left">WEEKLY GOAL</p>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-gray-300 hover:text-blue-600 transition-colors p-1 -mt-1 -mr-1"
                >
                    <Edit2 size={12} />
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center w-full">
                {isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="number"
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            className="border border-blue-200 p-1.5 rounded w-16 text-lg font-bold focus:border-blue-500 outline-none text-[#111827]"
                        />
                        <button onClick={handleUpdate} className="text-sm font-bold text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Save</button>
                    </div>
                ) : (
                    <h3 className="text-[38px] leading-none font-extrabold text-[#111827] mb-1 truncate text-center">
                        {currentHours} <span className="text-gray-400 text-[20px] font-bold">/ {weeklyGoal}</span>
                    </h3>
                )}

                <div className="w-full mt-2">
                    <div className="flex justify-between items-center text-[11px] font-bold mb-1.5 w-full">
                        <span className="text-blue-600">{currentProgress}% Done</span>
                        <span className={remainingHours > 0 ? "text-gray-500" : "text-green-600"}>
                            {remainingHours > 0 ? `${remainingHours}h left` : 'Goal Reached!'}
                        </span>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="absolute top-0 left-0 bottom-0 bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(currentProgress, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalProgress;
