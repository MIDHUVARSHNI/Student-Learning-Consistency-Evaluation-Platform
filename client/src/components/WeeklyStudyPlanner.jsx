import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, CheckSquare, StickyNote, Save } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = [
    '9.00 AM', '10.00 AM', '11.00 AM', '12.00 PM',
    '1.00 PM', '2.00 PM', '3.00 PM', '4.00 PM', '5.00 PM'
];

const DAY_COLORS = {
    'Monday': '#FFD93D',
    'Tuesday': '#9ADE7B',
    'Wednesday': '#FF8F8F',
    'Thursday': '#F29727',
    'Friday': '#A1EEBD'
};

const WeeklyStudyPlanner = () => {
    const [plannerData, setPlannerData] = useState(() => {
        const saved = localStorage.getItem('studyPlannerData');
        return saved ? JSON.parse(saved) : {};
    });

    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('studyPlannerNotes');
        return saved ? JSON.parse(saved) : { note: '', homework: '', todo: '' };
    });

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        localStorage.setItem('studyPlannerData', JSON.stringify(plannerData));
        localStorage.setItem('studyPlannerNotes', JSON.stringify(notes));
    }, [plannerData, notes]);

    const handleCellChange = (day, time, value) => {
        setPlannerData(prev => ({
            ...prev,
            [`${day}-${time}`]: value
        }));
        setIsSaved(false);
    };

    const handleNoteChange = (type, value) => {
        setNotes(prev => ({
            ...prev,
            [type]: value
        }));
        setIsSaved(false);
    };

    const handleManualSave = () => {
        localStorage.setItem('studyPlannerData', JSON.stringify(plannerData));
        localStorage.setItem('studyPlannerNotes', JSON.stringify(notes));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden font-sans border border-gray-100 mb-6 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-tight mb-1"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        Weekly Study Planner
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.15em] text-[10px]">Organize your academic goals</p>
                </div>
                <button
                    onClick={handleManualSave}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg active:translate-y-1 text-sm ${isSaved ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                >
                    {isSaved ? <><Save className="animate-bounce" size={16} /> SAVED!</> : <><Save size={16} /> SAVE CHANGES</>}
                </button>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_rgba(31,41,55,0.1)] mb-8">
                <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                        <tr>
                            <th className="bg-gray-800 text-white p-2 font-black border-r border-gray-700 w-24 uppercase tracking-wider text-[10px]">Time</th>
                            {DAYS.map(day => (
                                <th key={day} className="p-2 font-black text-gray-800 border-r border-gray-100 uppercase tracking-wider text-[10px]" style={{ backgroundColor: DAY_COLORS[day] }}>
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIMES.map(time => (
                            <tr key={time} className="group odd:bg-gray-50/20">
                                <td className="bg-gray-800 text-white p-2 font-bold border-r border-gray-700 text-center text-[10px] tracking-tighter">
                                    {time}
                                </td>
                                {DAYS.map(day => (
                                    <td key={`${day}-${time}`} className="border-r border-b border-gray-100 p-0 relative h-12 transition-colors hover:bg-white">
                                        <textarea
                                            value={plannerData[`${day}-${time}`] || ''}
                                            onChange={(e) => handleCellChange(day, time, e.target.value)}
                                            className="w-full h-full p-2 resize-none bg-transparent outline-none text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-100 focus:z-10 absolute inset-0 transition-all duration-200"
                                            placeholder="···"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Note */}
                <div className="relative group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-1 rounded-full font-black uppercase text-[10px] tracking-widest z-10 shadow-sm">
                        Note
                    </div>
                    <div className="bg-white border-2 border-gray-800 rounded-2xl p-4 pt-6 min-h-[120px] shadow-[4px_4px_0px_rgba(31,41,55,1)] transition-transform hover:-translate-y-0.5">
                        <textarea
                            value={notes.note}
                            onChange={(e) => handleNoteChange('note', e.target.value)}
                            className="w-full h-full min-h-[80px] resize-none outline-none text-gray-700 font-medium text-xs leading-relaxed"
                            placeholder="Write your important notes here..."
                        />
                    </div>
                </div>

                {/* Homework */}
                <div className="relative group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-1 rounded-full font-black uppercase text-[10px] tracking-widest z-10 shadow-sm">
                        Homework
                    </div>
                    <div className="bg-white border-2 border-gray-800 rounded-2xl p-4 pt-6 min-h-[120px] shadow-[4px_4px_0px_rgba(31,41,55,1)] transition-transform hover:-translate-y-0.5">
                        <textarea
                            value={notes.homework}
                            onChange={(e) => handleNoteChange('homework', e.target.value)}
                            className="w-full h-full min-h-[80px] resize-none outline-none text-gray-700 font-medium text-xs leading-relaxed"
                            placeholder="List your assignments and tasks..."
                        />
                    </div>
                </div>

                {/* To do list */}
                <div className="relative group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-1 rounded-full font-black uppercase text-[10px] tracking-widest z-10 shadow-sm">
                        To do list
                    </div>
                    <div className="bg-white border-2 border-gray-800 rounded-2xl p-4 pt-6 min-h-[120px] shadow-[4px_4px_0px_rgba(31,41,55,1)] transition-transform hover:-translate-y-0.5">
                        <textarea
                            value={notes.todo}
                            onChange={(e) => handleNoteChange('todo', e.target.value)}
                            className="w-full h-full min-h-[80px] resize-none outline-none text-gray-700 font-medium text-xs leading-relaxed"
                            placeholder="✓ Item 1&#10;✓ Item 2..."
                        />
                    </div>
                </div>
            </div>

            <style jsx>{`
                textarea::placeholder {
                    color: #cbd5e1;
                    opacity: 0.5;
                }
                table th:last-child, table td:last-child {
                    border-right: none;
                }
            `}</style>
        </div>
    );
};

export default WeeklyStudyPlanner;
