import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateSchedule, TIME_SLOTS, DAYS } from './TimetableView';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEPT_COLORS = {
    CSE: { bg: '#e8f0fe', text: '#0d47a1' },
    ECE: { bg: '#e8f5e9', text: '#1b5e20' },
    MECH: { bg: '#fff3e0', text: '#bf360c' },
    CIVIL: { bg: '#fce4ec', text: '#880e4f' },
    EEE: { bg: '#f3e5f5', text: '#4a148c' },
    IT: { bg: '#e0f7fa', text: '#006064' },
    AIDS: { bg: '#ede7f6', text: '#311b92' },
    BT: { bg: '#e8f5e9', text: '#1b5e20' },
    DEFAULT: { bg: '#f5f5f5', text: '#424242' },
};

// Map JS getDay() (0=Sun) to DAYS weekday names
function getDayName(js_day) {
    const map = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
    return map[js_day] || null; // null for Sunday
}

const MiniCalendarWidget = ({ staffName = 'Staff', dept = 'CSE' }) => {
    const now = new Date();
    const [viewDate, setViewDate] = useState({ year: now.getFullYear(), month: now.getMonth() });
    const schedule = generateSchedule(staffName, dept);

    const { year, month } = viewDate;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => { if (month === 0) setViewDate({ year: year - 1, month: 11 }); else setViewDate({ year, month: month - 1 }); };
    const nextMonth = () => { if (month === 11) setViewDate({ year: year + 1, month: 0 }); else setViewDate({ year, month: month + 1 }); };

    // Get class count for a given date
    const getClassCount = (date) => {
        const d = new Date(year, month, date);
        const dayName = getDayName(d.getDay());
        if (!dayName) return 0;
        const slots = Object.values(schedule[dayName] || {});
        return slots.filter(s => s && s.type === 'class').length;
    };

    const today = now.getDate();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

    // Build grid cells
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const [selectedDate, setSelectedDate] = useState(isCurrentMonth ? today : null);

    const todayScheduleDay = selectedDate ? getDayName(new Date(year, month, selectedDate).getDay()) : null;
    const todaySlots = todayScheduleDay ? TIME_SLOTS.map(slot => ({
        slot,
        entry: schedule[todayScheduleDay]?.[slot.id],
    })) : [];

    const c = DEPT_COLORS[dept] || DEPT_COLORS.DEFAULT;

    return (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Calendar */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e8eaf6', boxShadow: '0 2px 12px rgba(21,101,192,.07)', flex: '0 0 300px', minWidth: 260 }}>
                {/* Month nav */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <button onClick={prevMonth} style={{ background: '#f0f4ff', border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#1565c0' }}><ChevronLeft size={16} /></button>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{MONTH_NAMES[month]} {year}</span>
                    <button onClick={nextMonth} style={{ background: '#f0f4ff', border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#1565c0' }}><ChevronRight size={16} /></button>
                </div>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
                    {DAY_NAMES.map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#aaa', paddingBottom: 6 }}>{d}</div>
                    ))}
                </div>
                {/* Date cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                    {cells.map((d, i) => {
                        if (!d) return <div key={`e${i}`} />;
                        const count = getClassCount(d);
                        const isToday = isCurrentMonth && d === today;
                        const isSelected = d === selectedDate;
                        const isSunday = new Date(year, month, d).getDay() === 0;
                        return (
                            <button key={d} onClick={() => setSelectedDate(d)}
                                style={{
                                    borderRadius: 7, padding: '5px 2px', border: 'none', cursor: isSunday ? 'default' : 'pointer', transition: 'all .15s',
                                    background: isSelected ? '#1565c0' : isToday ? '#e8f0fe' : '#fff',
                                    color: isSelected ? '#fff' : isToday ? '#1565c0' : isSunday ? '#ddd' : '#333',
                                    fontWeight: isToday || isSelected ? 700 : 400, fontSize: 12,
                                    outline: isToday && !isSelected ? '2px solid #1565c0' : 'none',
                                    position: 'relative'
                                }}>
                                {d}
                                {count > 0 && !isSunday && (
                                    <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: isSelected ? '#fff' : '#1565c0', margin: '2px auto 0', opacity: isSelected ? 0.8 : 1 }} />
                                )}
                            </button>
                        );
                    })}
                </div>
                {/* Legend */}
                <div style={{ marginTop: 14, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1565c0', display: 'inline-block' }} /> Has classes
                    </span>
                    <span style={{ fontSize: 10, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: '#e8f0fe', border: '2px solid #1565c0', display: 'inline-block' }} /> Today
                    </span>
                </div>
            </div>

            {/* Today's schedule */}
            <div style={{ flex: 1, minWidth: 240 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
                    {selectedDate
                        ? `Schedule — ${MONTH_NAMES[month].slice(0, 3)} ${selectedDate}`
                        : 'Select a date to view schedule'}
                </h3>
                {!todayScheduleDay && selectedDate && (
                    <div style={{ padding: '24px 20px', textAlign: 'center', color: '#aaa', background: '#f9f9f9', borderRadius: 12, border: '1px dashed #e0e0e0', fontSize: 13 }}>
                        🎉 Sunday — No classes scheduled
                    </div>
                )}
                {todaySlots.map(({ slot, entry }) => {
                    const isBreak = slot.isBreak;
                    const isFree = !entry || entry.type === 'free';
                    const dc = entry?.dept ? (DEPT_COLORS[entry.dept] || DEPT_COLORS.DEFAULT) : null;
                    return (
                        <div key={slot.id} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                            <div style={{ minWidth: 100, fontSize: 10, color: '#999', textAlign: 'right', paddingTop: 6, flexShrink: 0 }}>
                                {slot.label.split('–')[0].trim()}
                            </div>
                            <div style={{
                                flex: 1, borderRadius: 9, padding: '8px 12px',
                                background: isBreak ? '#fff3e0' : isFree ? '#f9f9f9' : dc?.bg,
                                border: `1.5px ${isFree && !isBreak ? 'dashed #e0e0e0' : 'solid ' + (isBreak ? '#e65100' : (dc?.text || '#bbb'))}`
                            }}>
                                {isBreak ? (
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#e65100' }}>🍽 Lunch Break</p>
                                ) : isFree ? (
                                    <p style={{ fontSize: 12, color: '#ccc', fontWeight: 600 }}>Free Period</p>
                                ) : (
                                    <>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: dc?.text, marginBottom: 2 }}>{entry.subject}</p>
                                        <p style={{ fontSize: 11, color: '#666' }}>📚 {entry.year} &nbsp;•&nbsp; 🚪 {entry.room}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MiniCalendarWidget;
