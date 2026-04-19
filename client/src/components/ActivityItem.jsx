import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteActivity } from '../slices/activitySlice';
import { Trash2, FileText } from 'lucide-react';

const ActivityItem = ({ activity }) => {
    const dispatch = useDispatch();

    const getStatusProps = (status) => {
        switch (status) {
            case 'completed':
                return { badgeColor: 'bg-green-100 text-green-700', badgeText: 'DONE', borderColor: 'border-green-500', iconText: '↗ Completed', iconColor: 'text-green-600' };
            case 'in-progress':
                return { badgeColor: 'bg-blue-100 text-blue-700', badgeText: 'WIP', borderColor: 'border-blue-500', iconText: '→ In Progress', iconColor: 'text-blue-600' };
            case 'skipped':
                return { badgeColor: 'bg-gray-100 text-gray-700', badgeText: 'SKIP', borderColor: 'border-gray-500', iconText: '↘ Skipped', iconColor: 'text-gray-600' };
            default:
                return { badgeColor: 'bg-green-100 text-green-700', badgeText: 'DONE', borderColor: 'border-green-500', iconText: '↗ Completed', iconColor: 'text-green-600' };
        }
    };

    const sProps = getStatusProps(activity.status);

    return (
        <div className={`bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md group relative min-w-[260px] max-w-[300px]`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-extrabold text-[#111827] uppercase">{activity.subject.substring(0, 10)}</h3>
                <span className={`${sProps.badgeColor} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>{sProps.badgeText}</span>
            </div>

            <div className="mb-4">
                <p className="text-[#6b7280] text-[11px] font-bold uppercase tracking-wider mb-2">Duration</p>
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full border-4 ${sProps.borderColor} flex items-center justify-center`}>
                        <span className="text-sm font-black text-[#111827]">{activity.duration}</span>
                    </div>
                    <div>
                        <p className="text-xl font-extrabold text-[#111827] mb-0.5">{activity.duration}m</p>
                        <p className={`text-[11px] font-bold ${sProps.iconColor}`}>{sProps.iconText}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 mb-5">
                <div className="flex justify-between items-center border-[0.5px] border-b-gray-100 pb-1">
                    <span className="text-[#6b7280] text-[12px] font-medium">Topic:</span>
                    <span className="text-[#111827] text-[12px] font-bold text-right truncate max-w-[120px]">{activity.topic}</span>
                </div>
                {activity.justification && (
                    <div className="flex justify-between items-start border-[0.5px] border-b-gray-100 pb-1">
                        <span className="text-[#6b7280] text-[12px] font-medium">Justification:</span>
                        <span className="text-[#111827] text-[12px] font-bold text-right max-w-[140px]">{activity.justification}</span>
                    </div>
                )}
                <div className="flex justify-between items-center border-[0.5px] border-b-gray-100 pb-1">
                    <span className="text-[#6b7280] text-[12px] font-medium">Date:</span>
                    <span className="text-[#111827] text-[12px] font-bold text-right">{new Date(activity.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center border-[0.5px] border-b-gray-100 pb-1">
                    <span className="text-[#6b7280] text-[12px] font-medium">Status:</span>
                    <span className="text-[#111827] text-[12px] font-bold text-right">{activity.status === 'in-progress' ? 'In Progress' : activity.status ? activity.status.charAt(0).toUpperCase() + activity.status.slice(1) : 'Logged'}</span>
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center transition-colors group-hover:bg-blue-50 group-hover:border-blue-100">
                <p className="text-[11px] font-bold text-[#4b5563] group-hover:text-blue-700">No intervention required</p>
            </div>

            <button
                onClick={() => dispatch(deleteActivity(activity._id))}
                className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                title="Delete Activity"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
};

export default ActivityItem;
