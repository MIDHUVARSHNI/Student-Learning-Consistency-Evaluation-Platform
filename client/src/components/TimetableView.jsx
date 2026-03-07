import React, { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ─── Shared time slots (student + staff) ─────────── */
const TIME_SLOTS = [
    { id: 0, label: '8:00 – 9:00 AM' },
    { id: 1, label: '9:00 – 10:00 AM' },
    { id: 2, label: '10:00 – 10:25 AM', isShortBreak: true },   // ← short break
    { id: 3, label: '10:25 – 11:25 AM' },
    { id: 4, label: '11:25 – 12:25 PM' },
    { id: 5, label: '12:25 – 1:00 PM', isLunch: true },        // ← lunch
    { id: 6, label: '1:00 – 2:00 PM' },
    { id: 7, label: '2:00 – 3:10 PM' },
    { id: 8, label: '3:10 – 3:25 PM', isShortBreak: true },   // ← short break
    { id: 9, label: '3:25 – 4:25 PM' },
    { id: 10, label: '4:25 – 5:00 PM', isLab: true },          // ← lab (end of day)
];

const COLORS = {
    theory: { bg: '#e8f0fe', border: '#1565c0', text: '#0d47a1', badge: '#bbdefb' },
    lab: { bg: '#e8f5e9', border: '#2e7d32', text: '#1b5e20', badge: '#c8e6c9' },
    free: { bg: '#f9f9f9', border: '#e0e0e0', text: '#bbb' },
    lunch: { bg: '#fff8e1', border: '#ffa000', text: '#e65100' },
    shortBreak: { bg: '#fce4ec', border: '#c62828', text: '#b71c1c' },
};

/* ═══════════════════════════════════════
   STUDENT SCHEDULE — no free periods
═══════════════════════════════════════ */
const STUDENT_SCHEDULE = {
    Monday: {
        0: { type: 'theory', subject: 'Data Structures', faculty: 'Prof. Rajan', room: 'A101' },
        1: { type: 'theory', subject: 'Operating Systems', faculty: 'Prof. Meena', room: 'B202' },
        2: null, // short break
        3: { type: 'theory', subject: 'Computer Networks', faculty: 'Prof. Kumar', room: 'C303' },
        4: { type: 'theory', subject: 'DBMS', faculty: 'Prof. Priya', room: 'A104' },
        5: null, // lunch
        6: { type: 'theory', subject: 'Software Engineering', faculty: 'Prof. Suresh', room: 'B201' },
        7: { type: 'theory', subject: 'AI & Machine Learning', faculty: 'Prof. Divya', room: 'C303' },
        8: null, // short break
        9: { type: 'theory', subject: 'Compiler Design', faculty: 'Prof. Anand', room: 'A102' },
        10: { type: 'lab', subject: 'DS Lab', faculty: 'Prof. Rajan', room: 'Lab-1' },
    },
    Tuesday: {
        0: { type: 'theory', subject: 'AI & Machine Learning', faculty: 'Prof. Divya', room: 'A101' },
        1: { type: 'theory', subject: 'DBMS', faculty: 'Prof. Priya', room: 'B202' },
        2: null,
        3: { type: 'theory', subject: 'Computer Networks', faculty: 'Prof. Kumar', room: 'C303' },
        4: { type: 'theory', subject: 'Data Structures', faculty: 'Prof. Rajan', room: 'A101' },
        5: null,
        6: { type: 'theory', subject: 'Operating Systems', faculty: 'Prof. Meena', room: 'A101' },
        7: { type: 'theory', subject: 'Compiler Design', faculty: 'Prof. Anand', room: 'B202' },
        8: null,
        9: { type: 'theory', subject: 'Software Engineering', faculty: 'Prof. Suresh', room: 'C303' },
        10: { type: 'lab', subject: 'Networks Lab', faculty: 'Prof. Kumar', room: 'Lab-2' },
    },
    Wednesday: {
        0: { type: 'theory', subject: 'Data Structures', faculty: 'Prof. Rajan', room: 'B202' },
        1: { type: 'theory', subject: 'Compiler Design', faculty: 'Prof. Anand', room: 'A101' },
        2: null,
        3: { type: 'theory', subject: 'Software Engineering', faculty: 'Prof. Suresh', room: 'A104' },
        4: { type: 'theory', subject: 'AI & Machine Learning', faculty: 'Prof. Divya', room: 'C303' },
        5: null,
        6: { type: 'theory', subject: 'DBMS', faculty: 'Prof. Priya', room: 'A101' },
        7: { type: 'theory', subject: 'Computer Networks', faculty: 'Prof. Kumar', room: 'B202' },
        8: null,
        9: { type: 'theory', subject: 'Operating Systems', faculty: 'Prof. Meena', room: 'C303' },
        10: { type: 'lab', subject: 'DBMS Lab', faculty: 'Prof. Priya', room: 'Lab-1' },
    },
    Thursday: {
        0: { type: 'theory', subject: 'Computer Networks', faculty: 'Prof. Kumar', room: 'C303' },
        1: { type: 'theory', subject: 'Operating Systems', faculty: 'Prof. Meena', room: 'A101' },
        2: null,
        3: { type: 'theory', subject: 'AI & Machine Learning', faculty: 'Prof. Divya', room: 'B202' },
        4: { type: 'theory', subject: 'Compiler Design', faculty: 'Prof. Anand', room: 'C303' },
        5: null,
        6: { type: 'theory', subject: 'Software Engineering', faculty: 'Prof. Suresh', room: 'A104' },
        7: { type: 'theory', subject: 'Data Structures', faculty: 'Prof. Rajan', room: 'C303' },
        8: null,
        9: { type: 'theory', subject: 'DBMS', faculty: 'Prof. Priya', room: 'B202' },
        10: { type: 'lab', subject: 'AI / ML Lab', faculty: 'Prof. Divya', room: 'Lab-2' },
    },
    Friday: {
        0: { type: 'theory', subject: 'DBMS', faculty: 'Prof. Priya', room: 'A101' },
        1: { type: 'theory', subject: 'Software Engineering', faculty: 'Prof. Suresh', room: 'B202' },
        2: null,
        3: { type: 'theory', subject: 'Operating Systems', faculty: 'Prof. Meena', room: 'C303' },
        4: { type: 'theory', subject: 'Data Structures', faculty: 'Prof. Rajan', room: 'A101' },
        5: null,
        6: { type: 'theory', subject: 'AI & Machine Learning', faculty: 'Prof. Divya', room: 'A104' },
        7: { type: 'theory', subject: 'Compiler Design', faculty: 'Prof. Anand', room: 'B202' },
        8: null,
        9: { type: 'theory', subject: 'Computer Networks', faculty: 'Prof. Kumar', room: 'A101' },
        10: { type: 'lab', subject: 'OS Lab', faculty: 'Prof. Meena', room: 'Lab-1' },
    },
    Saturday: {
        0: { type: 'theory', subject: 'Data Structures', faculty: 'Prof. Rajan', room: 'A101' },
        1: { type: 'theory', subject: 'Computer Networks', faculty: 'Prof. Kumar', room: 'B202' },
        2: null,
        3: { type: 'theory', subject: 'DBMS', faculty: 'Prof. Priya', room: 'C303' },
        4: { type: 'theory', subject: 'Software Engineering', faculty: 'Prof. Suresh', room: 'A104' },
        5: null,
        6: null, // no afternoon on Saturday
        7: null,
        8: null,
        9: null,
        10: null,
    },
};

/* ═══════════════════════════════════════
   STAFF SCHEDULE — has some free periods
═══════════════════════════════════════ */
const STAFF_SCHEDULE = {
    Monday: {
        0: { type: 'theory', subject: 'Data Structures', batch: 'B.E. II-A', room: 'A101' },
        1: { type: 'free' },
        2: null,
        3: { type: 'theory', subject: 'Computer Networks', batch: 'B.E. III-B', room: 'B202' },
        4: { type: 'theory', subject: 'DBMS', batch: 'B.E. II-B', room: 'C303' },
        5: null,
        6: { type: 'free' },
        7: { type: 'theory', subject: 'AI & Machine Learning', batch: 'B.E. IV', room: 'A104' },
        8: null,
        9: { type: 'lab', subject: 'DS Lab', batch: 'B.E. II-A', room: 'Lab-1' },
        10: { type: 'free' },
    },
    Tuesday: {
        0: { type: 'free' },
        1: { type: 'theory', subject: 'DBMS', batch: 'B.E. II-A', room: 'B202' },
        2: null,
        3: { type: 'theory', subject: 'Computer Networks', batch: 'B.E. III-A', room: 'C303' },
        4: { type: 'free' },
        5: null,
        6: { type: 'theory', subject: 'Data Structures', batch: 'B.E. II-B', room: 'A101' },
        7: { type: 'free' },
        8: null,
        9: { type: 'lab', subject: 'Networks Lab', batch: 'B.E. III-A', room: 'Lab-2' },
        10: { type: 'free' },
    },
    Wednesday: {
        0: { type: 'theory', subject: 'Data Structures', batch: 'B.E. II-A', room: 'B202' },
        1: { type: 'theory', subject: 'Compiler Design', batch: 'B.E. III', room: 'A101' },
        2: null,
        3: { type: 'free' },
        4: { type: 'theory', subject: 'AI & Machine Learning', batch: 'B.E. IV', room: 'C303' },
        5: null,
        6: { type: 'theory', subject: 'DBMS', batch: 'B.E. II-B', room: 'A101' },
        7: { type: 'free' },
        8: null,
        9: { type: 'free' },
        10: { type: 'lab', subject: 'DBMS Lab', batch: 'B.E. II-B', room: 'Lab-1' },
    },
    Thursday: {
        0: { type: 'theory', subject: 'Computer Networks', batch: 'B.E. III-B', room: 'C303' },
        1: { type: 'free' },
        2: null,
        3: { type: 'theory', subject: 'AI & Machine Learning', batch: 'B.E. IV', room: 'B202' },
        4: { type: 'theory', subject: 'Compiler Design', batch: 'B.E. III', room: 'C303' },
        5: null,
        6: { type: 'free' },
        7: { type: 'theory', subject: 'Data Structures', batch: 'B.E. II-A', room: 'C303' },
        8: null,
        9: { type: 'lab', subject: 'AI / ML Lab', batch: 'B.E. IV', room: 'Lab-2' },
        10: { type: 'free' },
    },
    Friday: {
        0: { type: 'theory', subject: 'DBMS', batch: 'B.E. II-A', room: 'A101' },
        1: { type: 'theory', subject: 'Software Engineering', batch: 'B.E. III', room: 'B202' },
        2: null,
        3: { type: 'free' },
        4: { type: 'theory', subject: 'Data Structures', batch: 'B.E. II-B', room: 'A101' },
        5: null,
        6: { type: 'free' },
        7: { type: 'theory', subject: 'Compiler Design', batch: 'B.E. III', room: 'B202' },
        8: null,
        9: { type: 'free' },
        10: { type: 'lab', subject: 'OS Lab', batch: 'B.E. II-A', room: 'Lab-1' },
    },
    Saturday: {
        0: { type: 'theory', subject: 'Data Structures', batch: 'B.E. II-A', room: 'A101' },
        1: { type: 'free' },
        2: null,
        3: { type: 'theory', subject: 'DBMS', batch: 'B.E. II-B', room: 'C303' },
        4: { type: 'free' },
        5: null,
        6: null,
        7: null,
        8: null,
        9: null,
        10: null,
    },
};

/* ─── Render a single cell ────────────────────────── */
const renderCell = (cell, slot, day, isStaff) => {
    if (slot.isShortBreak) {
        return (
            <td key={day} style={{ padding: '6px 10px', background: COLORS.shortBreak.bg, borderRadius: 8, textAlign: 'center', border: '1.5px solid ' + COLORS.shortBreak.border }}>
                <span style={{ fontSize: 11, color: COLORS.shortBreak.text, fontWeight: 700 }}>Short Break</span>
            </td>
        );
    }
    if (slot.isLunch) {
        return (
            <td key={day} style={{ padding: '6px 10px', background: COLORS.lunch.bg, borderRadius: 8, textAlign: 'center', border: '1.5px solid ' + COLORS.lunch.border }}>
                <span style={{ fontSize: 11, color: COLORS.lunch.text, fontWeight: 700 }}>Lunch Break</span>
            </td>
        );
    }
    // Saturday afternoon is empty
    if (!cell) {
        if (day === 'Saturday' && slot.id >= 6) {
            return (
                <td key={day} style={{ padding: '8px 10px', background: '#fafafa', borderRadius: 8, textAlign: 'center', border: '1px dashed #ececec' }}>
                    <span style={{ fontSize: 10, color: '#ddd', fontWeight: 600 }}>—</span>
                </td>
            );
        }
        return (
            <td key={day} style={{ padding: '8px 10px', background: COLORS.free.bg, borderRadius: 8, textAlign: 'center', border: '1.5px dashed ' + COLORS.free.border }}>
                <span style={{ fontSize: 11, color: COLORS.free.text, fontWeight: 600 }}>Free Period</span>
            </td>
        );
    }
    if (cell.type === 'free') {
        return (
            <td key={day} style={{ padding: '8px 10px', background: COLORS.free.bg, borderRadius: 8, textAlign: 'center', border: '1.5px dashed ' + COLORS.free.border }}>
                <span style={{ fontSize: 11, color: COLORS.free.text, fontWeight: 600 }}>Free Period</span>
            </td>
        );
    }
    const c = cell.type === 'lab' ? COLORS.lab : COLORS.theory;
    return (
        <td key={day} style={{ padding: '9px 11px', background: c.bg, borderRadius: 8, border: '1.5px solid ' + c.border, verticalAlign: 'top' }}>
            {cell.type === 'lab' && (
                <span style={{ fontSize: 9, fontWeight: 800, background: c.badge, color: c.text, borderRadius: 4, padding: '1px 6px', display: 'inline-block', marginBottom: 4, letterSpacing: '.5px', textTransform: 'uppercase' }}>
                    Lab · 2hrs
                </span>
            )}
            <p style={{ fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 3, lineHeight: 1.3 }}>{cell.subject}</p>
            {isStaff ? (
                <p style={{ fontSize: 10, color: '#555' }}>{cell.batch} &nbsp;·&nbsp; {cell.room}</p>
            ) : (
                <>
                    <p style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>{cell.faculty}</p>
                    <p style={{ fontSize: 10, color: '#888' }}>{cell.room}</p>
                </>
            )}
        </td>
    );
};

/* ─── Day summary bar ────────────────────────────── */
const DaySummary = ({ schedule, isStaff }) => {
    const summary = DAYS.map(day => {
        const slots = Object.values(schedule[day] || {});
        const theory = slots.filter(s => s && s.type === 'theory').length;
        const labs = slots.filter(s => s && s.type === 'lab').length;
        const free = slots.filter(s => s && s.type === 'free').length;
        return { day, theory, labs, free };
    });
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 22 }}>
            {summary.map(({ day, theory, labs, free }, i) => (
                <div key={day} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #e8eaf6', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6 }}>{SHORT_DAYS[i]}</p>
                    <p style={{ fontSize: 17, fontWeight: 800, color: '#1565c0' }}>{theory}</p>
                    <p style={{ fontSize: 10, color: '#888' }}>classes</p>
                    {labs > 0 && <p style={{ fontSize: 11, color: '#2e7d32', fontWeight: 700, marginTop: 3 }}>{labs} lab</p>}
                    {isStaff && free > 0 && <p style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{free} free</p>}
                </div>
            ))}
        </div>
    );
};

/* ─── Legend ─────────────────────────────────────── */
const Legend = ({ isStaff }) => (
    <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Legend:</span>
        {[
            { label: 'Theory Class', c: COLORS.theory },
            { label: 'Lab Session', c: COLORS.lab },
            { label: 'Short Break', c: COLORS.shortBreak },
            { label: 'Lunch Break', c: COLORS.lunch },
            ...(isStaff ? [{ label: 'Free Period', c: COLORS.free }] : []),
        ].map(({ label, c }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: c.text, fontWeight: 600 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: c.bg, border: '2px solid ' + c.border, display: 'inline-block' }} />
                {label}
            </span>
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════
   Main TimetableView Component
═══════════════════════════════════════════════════ */
const TimetableView = ({ dept = 'CSE', isStaff = false }) => {
    const [activeDay, setActiveDay] = useState(null);
    const schedule = isStaff ? STAFF_SCHEDULE : STUDENT_SCHEDULE;
    const visibleDays = activeDay ? [activeDay] : DAYS;

    return (
        <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>
                        {isStaff ? 'My Teaching Schedule' : 'My Timetable'}
                    </h2>
                    <p style={{ fontSize: 13, color: '#888', marginTop: 3 }}>
                        Department: <strong style={{ color: '#1565c0' }}>{dept}</strong>
                        &nbsp;·&nbsp;
                        <span style={{ color: '#c62828', fontWeight: 600 }}>Breaks: 10:00–10:25 & 3:10–3:25</span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setActiveDay(null)}
                        style={{ padding: '6px 12px', borderRadius: 7, border: '1.5px solid ' + (activeDay === null ? '#1565c0' : '#e0e7ff'), background: activeDay === null ? '#1565c0' : '#fff', color: activeDay === null ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                        Full Week
                    </button>
                    {DAYS.map(d => (
                        <button
                            key={d}
                            onClick={() => setActiveDay(d)}
                            style={{ padding: '6px 12px', borderRadius: 7, border: '1.5px solid ' + (activeDay === d ? '#1565c0' : '#e0e7ff'), background: activeDay === d ? '#1565c0' : '#fff', color: activeDay === d ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                            {d.slice(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            {!activeDay && <DaySummary schedule={schedule} isStaff={isStaff} />}
            <Legend isStaff={isStaff} />

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px 4px', minWidth: activeDay ? 420 : 960 }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px 14px', background: '#f0f4ff', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#555', textAlign: 'left', minWidth: 140 }}>Time Slot</th>
                            {visibleDays.map(d => (
                                <th key={d} style={{ padding: '10px 14px', background: '#f0f4ff', borderRadius: 8, fontSize: 11, fontWeight: 700, color: d === 'Saturday' ? '#e65100' : '#1565c0', textAlign: 'center', minWidth: activeDay ? 240 : 140 }}>{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map(slot => (
                            <tr key={slot.id}>
                                <td style={{
                                    padding: '8px 14px',
                                    background: slot.isShortBreak ? COLORS.shortBreak.bg : slot.isLunch ? COLORS.lunch.bg : slot.isLab ? COLORS.lab.bg : '#fafbff',
                                    borderRadius: 8,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: slot.isShortBreak ? COLORS.shortBreak.text : slot.isLunch ? COLORS.lunch.text : slot.isLab ? COLORS.lab.text : '#666',
                                    border: '1px solid #f0f4ff',
                                    verticalAlign: 'middle',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {slot.label}
                                </td>
                                {visibleDays.map(day => renderCell(schedule[day]?.[slot.id], slot, day, isStaff))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimetableView;

// Backward-compat export for MiniCalendarWidget
const generateSchedule = () => STUDENT_SCHEDULE;
export { STUDENT_SCHEDULE, STAFF_SCHEDULE, TIME_SLOTS, DAYS, generateSchedule };
