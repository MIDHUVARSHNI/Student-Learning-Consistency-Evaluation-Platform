import React, { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIME_SLOTS = [
    { id: 0, label: '8:00 – 9:00 am', start: '08:00' },
    { id: 1, label: '9:00 – 10:00 am', start: '09:00' },
    { id: 2, label: '10:00 – 11:00 am', start: '10:00' },
    { id: 3, label: '11:00 – 12:00 pm', start: '11:00' },
    { id: 4, label: '12:00 – 1:00 pm', start: '12:00', isBreak: true },
    { id: 5, label: '1:00 – 2:00 pm', start: '13:00' },
    { id: 6, label: '2:00 – 3:00 pm', start: '14:00' },
    { id: 7, label: '3:00 – 4:00 pm', start: '15:00' },
];

const DEPT_COLORS = {
    CSE: { bg: '#e8f0fe', border: '#1565c0', text: '#0d47a1' },
    ECE: { bg: '#e8f5e9', border: '#2e7d32', text: '#1b5e20' },
    MECH: { bg: '#fff3e0', border: '#e65100', text: '#bf360c' },
    CIVIL: { bg: '#fce4ec', border: '#c2185b', text: '#880e4f' },
    EEE: { bg: '#f3e5f5', border: '#7b1fa2', text: '#4a148c' },
    IT: { bg: '#e0f7fa', border: '#00838f', text: '#006064' },
    AIDS: { bg: '#ede7f6', border: '#512da8', text: '#311b92' },
    BT: { bg: '#e8f5e9', border: '#388e3c', text: '#1b5e20' },
    DEFAULT: { bg: '#f5f5f5', border: '#9e9e9e', text: '#424242' },
};

const DEPT_SUBJECTS = {
    CSE: ['Data Structures', 'Operating Systems', 'DBMS', 'Computer Networks', 'AI/ML', 'Web Tech', 'Compiler Design', 'Theory of Computation'],
    ECE: ['Circuit Theory', 'Digital Electronics', 'Signals & Systems', 'Analog Comm.', 'Digital Comm.', 'VLSI Design', 'Microprocessors', 'Embedded Systems'],
    MECH: ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Manufacturing Tech', 'Machine Design', 'Heat Transfer', 'CAD/CAM', 'Robotics'],
    CIVIL: ['Structural Analysis', 'Soil Mechanics', 'Surveying', 'Transportation Engg.', 'Environmental Engg.', 'Concrete Tech', 'Hydraulics', 'Foundation Engg.'],
    EEE: ['Electrical Circuits', 'Electrical Machines', 'Power Systems', 'Control Systems', 'Power Electronics', 'High Voltage Engg.', 'Renewable Energy', 'Smart Grid'],
    IT: ['Programming in C', 'OOP', 'Computer Architecture', 'Network Security', 'Cloud Computing', 'Mobile App Dev', 'Big Data Analytics', 'Cyber Security'],
    AIDS: ['Python Programming', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Visualization', 'Big Data Tech', 'AI Ethics'],
    BT: ['Cell Biology', 'Microbiology', 'Biochemistry', 'Molecular Biology', 'Genetic Engineering', 'Immunology', 'Bioinformatics', 'Fermentation Tech'],
};

// Seeded pseudo-random: consistent per (staffName, day, slot)
function seededRand(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    return ((h >>> 0) % 1000) / 1000;
}

function generateSchedule(staffName, dept) {
    const subjects = DEPT_SUBJECTS[dept] || DEPT_SUBJECTS['CSE'];
    const rooms = ['A101', 'B202', 'C303', 'D104', 'Lab-1', 'Lab-2', 'Seminar Hall'];
    const years = ['B.E. I', 'B.E. II', 'B.E. III', 'B.E. IV'];
    const schedule = {};

    DAYS.forEach((day, di) => {
        schedule[day] = {};
        TIME_SLOTS.forEach((slot, si) => {
            if (slot.isBreak) { schedule[day][slot.id] = null; return; }
            const key = `${staffName}-${di}-${si}`;
            const r = seededRand(key);
            // ~40% chance free, 60% class; Saturday ~70% free
            const freeChance = day === 'Saturday' ? 0.7 : 0.38;
            if (r < freeChance) {
                schedule[day][slot.id] = { type: 'free' };
            } else {
                const subjIdx = Math.floor(seededRand(key + 'subj') * subjects.length);
                const yearIdx = Math.floor(seededRand(key + 'yr') * years.length);
                const roomIdx = Math.floor(seededRand(key + 'room') * rooms.length);
                schedule[day][slot.id] = {
                    type: 'class',
                    subject: subjects[subjIdx],
                    year: years[yearIdx],
                    room: rooms[roomIdx],
                    dept,
                };
            }
        });
    });
    return schedule;
}

/* ─── Legend ─────────────────────────────────────── */
const Legend = () => (
    <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Legend:</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#1565c0', fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: '#e8f0fe', border: '2px solid #1565c0', display: 'inline-block' }} /> Class
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#888', fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: '#f5f5f5', border: '2px dashed #bbb', display: 'inline-block' }} /> Free Period
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#e65100', fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: '#fff3e0', border: '2px solid #e65100', display: 'inline-block' }} /> Lunch Break
        </span>
    </div>
);

/* ─── Day summary bar ────────────────────────────── */
const DaySummary = ({ schedule }) => {
    const summary = DAYS.map(day => {
        const slots = Object.values(schedule[day] || {});
        const classes = slots.filter(s => s && s.type === 'class').length;
        const free = slots.filter(s => s && s.type === 'free').length;
        return { day, classes, free };
    });
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 22 }}>
            {summary.map(({ day, classes, free }, i) => (
                <div key={day} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #e8eaf6', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6 }}>{SHORT_DAYS[i]}</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#1565c0' }}>{classes}</p>
                    <p style={{ fontSize: 10, color: '#888' }}>classes</p>
                    <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{free} free</p>
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   Main TimetableView Component
═══════════════════════════════════════════════════ */
const TimetableView = ({ staffName = 'Staff', dept = 'CSE' }) => {
    const [activeDay, setActiveDay] = useState(null); // null = full week, string = single day
    const schedule = generateSchedule(staffName, dept);

    const visibleDays = activeDay ? [activeDay] : DAYS;
    const deptColor = DEPT_COLORS[dept] || DEPT_COLORS.DEFAULT;

    return (
        <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>My Timetable</h2>
                    <p style={{ fontSize: 13, color: '#888', marginTop: 3 }}>{staffName} &nbsp;•&nbsp; Department: <strong style={{ color: deptColor.text }}>{dept}</strong></p>
                </div>
                {/* Day tabs */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveDay(null)}
                        style={{ padding: '6px 12px', borderRadius: 7, border: `1.5px solid ${activeDay === null ? '#1565c0' : '#e0e7ff'}`, background: activeDay === null ? '#1565c0' : '#fff', color: activeDay === null ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Full Week
                    </button>
                    {DAYS.map(d => (
                        <button key={d} onClick={() => setActiveDay(d)}
                            style={{ padding: '6px 12px', borderRadius: 7, border: `1.5px solid ${activeDay === d ? '#1565c0' : '#e0e7ff'}`, background: activeDay === d ? '#1565c0' : '#fff', color: activeDay === d ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            {d.slice(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Daily summary */}
            {!activeDay && <DaySummary schedule={schedule} />}

            <Legend />

            {/* Timetable grid */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px 4px', minWidth: activeDay ? 400 : 900 }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px 14px', background: '#f0f4ff', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#555', textAlign: 'left', minWidth: 130 }}>Time Slot</th>
                            {visibleDays.map(d => (
                                <th key={d} style={{ padding: '10px 14px', background: '#f0f4ff', borderRadius: 8, fontSize: 11, fontWeight: 700, color: d === 'Saturday' ? '#e65100' : '#1565c0', textAlign: 'center', minWidth: activeDay ? 220 : 140 }}>{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map(slot => (
                            <tr key={slot.id}>
                                <td style={{ padding: '8px 14px', background: slot.isBreak ? '#fff3e0' : '#fafbff', borderRadius: 8, fontSize: 12, fontWeight: 600, color: slot.isBreak ? '#e65100' : '#666', border: '1px solid #f0f4ff', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                    {slot.isBreak ? '🍽 ' : ''}{slot.label}
                                </td>
                                {visibleDays.map(day => {
                                    const cell = schedule[day]?.[slot.id];
                                    if (slot.isBreak) {
                                        return (
                                            <td key={day} style={{ padding: '8px 10px', background: '#fff3e0', borderRadius: 8, textAlign: 'center', border: '1px solid #ffe0b2' }}>
                                                <span style={{ fontSize: 11, color: '#e65100', fontWeight: 700 }}>🍽 Lunch Break</span>
                                            </td>
                                        );
                                    }
                                    if (!cell || cell.type === 'free') {
                                        return (
                                            <td key={day} style={{ padding: '8px 10px', background: '#f9f9f9', borderRadius: 8, textAlign: 'center', border: '1.5px dashed #e0e0e0' }}>
                                                <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600 }}>Free Period</span>
                                            </td>
                                        );
                                    }
                                    const c = DEPT_COLORS[cell.dept] || DEPT_COLORS.DEFAULT;
                                    return (
                                        <td key={day} style={{ padding: '8px 10px', background: c.bg, borderRadius: 8, border: `1.5px solid ${c.border}`, verticalAlign: 'top' }}>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 3, lineHeight: 1.3 }}>{cell.subject}</p>
                                            <p style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>📚 {cell.year}</p>
                                            <p style={{ fontSize: 10, color: '#888' }}>🚪 Room {cell.room}</p>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimetableView;
export { generateSchedule, TIME_SLOTS, DAYS };
