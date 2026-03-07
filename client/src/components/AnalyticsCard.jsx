import React from 'react';
import { Activity, Clock, Trophy } from 'lucide-react';

const AnalyticsCard = ({ data }) => {
    const { totalHours, consistencyScore, totalActivities } = data;

    return (
        <>
            {[
                { label: 'STUDENT CONSISTENCY', value: `${totalHours} hrs`, sub: 'Total Study Hours', color: 'text-green-600' },
                { label: 'CONSISTENCY SCORE', value: `${consistencyScore}%`, sub: 'Overall Score', color: 'text-blue-600' },
                { label: 'TOTAL ACTIVITIES', value: totalActivities, sub: 'Logged Sessions', color: 'text-purple-600' },
            ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col relative min-h-[145px] w-full">
                    <p className="text-[#6b7280] text-[11px] font-bold uppercase tracking-wider mb-2 text-left">{item.label}</p>
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <h3 className="text-[38px] leading-none font-extrabold text-[#111827] text-center">{item.value}</h3>
                    </div>
                </div>
            ))}
        </>
    );
};

export default AnalyticsCard;
