import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';

const Heatmap = ({ data }) => {
    const today = new Date();
    const shiftDate = (date, numDays) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + numDays);
        return newDate;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Consistency Heatmap</h2>
            <div className="w-full overflow-x-auto">
                <CalendarHeatmap
                    startDate={shiftDate(today, -365)}
                    endDate={today}
                    values={data || []}
                    classForValue={(value) => {
                        if (!value) {
                            return 'color-empty';
                        }
                        return `color-scale-${Math.min(value.count, 4)}`;
                    }}
                    tooltipDataAttrs={value => {
                        if (!value || !value.date) {
                            return { 'data-tooltip-id': 'heatmap-tooltip', 'data-tooltip-content': 'No activity' };
                        }
                        return {
                            'data-tooltip-id': 'heatmap-tooltip',
                            'data-tooltip-content': `${value.date}: ${value.duration} mins`,
                        };
                    }}
                    showWeekdayLabels={true}
                />
                <Tooltip id="heatmap-tooltip" />
            </div>
            <style>{`
                .react-calendar-heatmap .color-empty { fill: #ebedf0; }
                .react-calendar-heatmap .color-scale-1 { fill: #c6e48b; }
                .react-calendar-heatmap .color-scale-2 { fill: #7bc96f; }
                .react-calendar-heatmap .color-scale-3 { fill: #239a3b; }
                .react-calendar-heatmap .color-scale-4 { fill: #196127; }
                .react-calendar-heatmap { width: 100%; }
            `}</style>
        </div>
    );
};

export default Heatmap;
