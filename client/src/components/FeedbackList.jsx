import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFeedback } from '../slices/feedbackSlice';

const FeedbackList = () => {
    const dispatch = useDispatch();
    const { feedbacks, isLoading } = useSelector((state) => state.feedback);

    useEffect(() => {
        dispatch(getFeedback());
    }, [dispatch]);

    if (isLoading) {
        return <p>Loading feedback...</p>;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold mb-4">Instructor Feedback</h3>
            {feedbacks.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {feedbacks.map((item) => (
                        <li key={item._id} className="py-4">
                            <p className="text-gray-800">{item.message}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-500">From: {item.educator.name}</span>
                                <span className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No feedback yet.</p>
            )}
        </div>
    );
};

export default FeedbackList;
