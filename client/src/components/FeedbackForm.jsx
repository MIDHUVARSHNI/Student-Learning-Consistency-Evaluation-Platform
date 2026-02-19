import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { sendFeedback } from '../slices/feedbackSlice';
import { Send } from 'lucide-react';

const FeedbackForm = ({ studentId, studentName, onClose }) => {
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(sendFeedback({ studentId, message }));
        setMessage('');
        onClose();
        alert('Feedback Sent!');
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Send Feedback to {studentName}</h3>
                    <form onSubmit={onSubmit} className="mt-2 px-7 py-3">
                        <textarea
                            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                            rows="4"
                            placeholder="Enter feedback..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                        <div className="items-center px-4 py-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 flex justify-center items-center"
                            >
                                <Send className="mr-2 h-4 w-4" /> Send
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;
