import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createActivity } from '../slices/activitySlice';
import toast from 'react-hot-toast';

const ActivityForm = () => {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        subject: '',
        topic: '',
        justification: '',
        duration: '',
        status: 'completed',
        notes: '',
    });

    const { subject, topic, justification, duration, status, notes } = formData;

    const onLogActivity = (e) => {
        e.preventDefault();
        if (!subject || !duration) {
            toast.error('Please fill in subject and duration');
            return;
        }
        dispatch(createActivity({ subject, topic, justification, duration: Number(duration), status, notes }));
        toast.success('Activity logged successfully!');
        setFormData({ subject: '', topic: '', justification: '', duration: '', status: 'completed', notes: '' });
    };

    const onChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        background: '#f8faff',
        border: '1.5px solid #e0e7ff',
        borderRadius: 10,
        fontSize: 13,
        color: '#333',
        outline: 'none',
        transition: 'border-color .15s',
        fontFamily: 'inherit',
    };

    const labelStyle = {
        display: 'block',
        fontSize: 11,
        fontWeight: 700,
        color: '#666',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        marginBottom: 6,
    };

    return (
        <div>
            {/* Subject + Topic */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                    <label style={labelStyle}>Subject</label>
                    <input
                        type="text"
                        name="subject"
                        value={subject}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. Mathematics"
                    />
                </div>
                <div>
                    <label style={labelStyle}>Topic</label>
                    <input
                        type="text"
                        name="topic"
                        value={topic}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. Calculus"
                    />
                </div>
            </div>

            {/* Justification */}
            <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Justification</label>
                <input
                    type="text"
                    name="justification"
                    value={justification}
                    onChange={onChange}
                    style={inputStyle}
                    placeholder="e.g. Preparing for unit test on derivatives"
                />
            </div>

            {/* Duration + Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                    <label style={labelStyle}>Duration (mins)</label>
                    <input
                        type="number"
                        name="duration"
                        value={duration}
                        onChange={onChange}
                        style={inputStyle}
                        placeholder="e.g. 60"
                        min="1"
                    />
                </div>
                <div>
                    <label style={labelStyle}>Status</label>
                    <select
                        name="status"
                        value={status}
                        onChange={onChange}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Notes</label>
                <textarea
                    name="notes"
                    value={notes}
                    onChange={onChange}
                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                    placeholder="Optional notes about your session..."
                />
            </div>

            {/* Save button */}
            <button
                type="button"
                onClick={onLogActivity}
                style={{
                    width: '100%',
                    padding: '12px 0',
                    background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'opacity .15s',
                    letterSpacing: '.3px',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
                Save Activity
            </button>
        </div>
    );
};

export default ActivityForm;
