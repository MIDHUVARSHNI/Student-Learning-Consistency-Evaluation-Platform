import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteActivity } from '../slices/activitySlice';
import { Trash2 } from 'lucide-react';

const ActivityItem = ({ activity }) => {
    const dispatch = useDispatch();

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold">{activity.subject}</h3>
                <p className="text-sm text-gray-600">Topic: {activity.topic}</p>
                <p className="text-sm text-gray-500">Duration: {activity.duration} mins | Status: {activity.status}</p>
                <p className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleString('en-US')}</p>
            </div>
            <button
                onClick={() => dispatch(deleteActivity(activity._id))}
                className="text-red-500 hover:text-red-700 transition"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );
};

export default ActivityItem;
