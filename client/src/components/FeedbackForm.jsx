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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '32px', maxWidth: 420, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>Send Feedback to {studentName}</h3>
                    <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
                        <textarea
                            style={{ width: '100%', minHeight: 120, padding: '14px', borderRadius: 12, border: '1.5px solid #e0e7ff', fontSize: 14, outline: 'none', marginBottom: 20, fontFamily: 'inherit', resize: 'vertical' }}
                            placeholder="Enter your feedback or review notes here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #e0e7ff', background: '#fff', fontWeight: 700, color: '#666', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: '#1565c0', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(21,101,192,0.3)' }}
                            >
                                <Send size={18} /> Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;
