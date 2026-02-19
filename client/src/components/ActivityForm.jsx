import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createActivity } from '../slices/activitySlice';
import { getEducators } from '../slices/educatorSlice';
import axios from 'axios';
import { CircleHelp } from 'lucide-react';
import toast from 'react-hot-toast';

const ActivityForm = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { educators } = useSelector((state) => state.educator);

    const [formData, setFormData] = useState({
        subject: '',
        topic: '',
        duration: '',
        status: 'completed',
        notes: '',
    });

    const [doubtData, setDoubtData] = useState({
        educatorId: '',
        doubt: ''
    });

    const { subject, topic, duration, status, notes } = formData;
    const { educatorId, doubt } = doubtData;

    useEffect(() => {
        dispatch(getEducators());
    }, [dispatch]);

    const onLogActivity = (e) => {
        e.preventDefault();
        if (!subject || !duration) {
            toast.error('Please fill in subject and duration');
            return;
        }

        dispatch(createActivity({ subject, topic, duration: Number(duration), status, notes }));
        toast.success('Activity logged successfully!');

        // Reset only activity form data
        setFormData({
            subject: '',
            topic: '',
            duration: '',
            status: 'completed',
            notes: '',
        });
    };

    const onSendDoubt = async (e) => {
        e.preventDefault();

        if (!doubt.trim()) {
            toast.error('Please type your doubt');
            return;
        }
        if (!educatorId) {
            toast.error('Please select a teacher');
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post('http://localhost:5000/api/messages', {
                recipientId: educatorId,
                content: `[DOUBT regarding ${subject || 'study session'}/${topic || 'general'}] ${doubt}`
            }, config);

            toast.success('Doubt sent to teacher!');

            // Reset doubt form data
            setDoubtData({
                educatorId: '',
                doubt: ''
            });
        } catch (error) {
            console.error('Error sending doubt:', error);
            toast.error('Failed to send doubt');
        }
    };

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onDoubtChange = (e) => {
        setDoubtData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                Activity & Support
            </h2>

            <form>
                {/* Activity Section */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Log Activity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1 ml-1" htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                id="subject"
                                value={subject}
                                onChange={onChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                placeholder="e.g. Mathematics"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1 ml-1" htmlFor="topic">Topic</label>
                            <input
                                type="text"
                                name="topic"
                                id="topic"
                                value={topic}
                                onChange={onChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                placeholder="e.g. Calculus"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1 ml-1" htmlFor="duration">Duration (mins)</label>
                            <input
                                type="number"
                                name="duration"
                                id="duration"
                                value={duration}
                                onChange={onChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1 ml-1" htmlFor="status">Status</label>
                            <select
                                name="status"
                                id="status"
                                value={status}
                                onChange={onChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
                            >
                                <option value="completed">Completed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="skipped">Skipped</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-xs font-bold mb-1 ml-1" htmlFor="notes">Notes</label>
                            <textarea
                                name="notes"
                                id="notes"
                                value={notes}
                                onChange={onChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[80px]"
                                placeholder="Optional notes about your session..."
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onLogActivity}
                        className="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        Save Activity
                    </button>
                </div>

                {/* Doubt Section */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CircleHelp size={16} /> Ask Doubt to Teacher
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1 ml-1" htmlFor="educatorId">Select Teacher</label>
                            <select
                                name="educatorId"
                                id="educatorId"
                                value={educatorId}
                                onChange={onDoubtChange}
                                className="w-full px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
                            >
                                <option value="">-- Choose a teacher --</option>
                                {educators.map(edu => (
                                    <option key={edu._id} value={edu._id}>{edu.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-xs font-bold mb-1 ml-1" htmlFor="doubt">Your Doubt</label>
                            <textarea
                                name="doubt"
                                id="doubt"
                                value={doubt}
                                onChange={onDoubtChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[100px]"
                                placeholder="Type your question here about this session or anything else..."
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onSendDoubt}
                        className="mt-4 w-full bg-white text-blue-600 border-2 border-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Send Doubt
                    </button>
                </div>
            </form>
        </section>
    );
};

export default ActivityForm;
