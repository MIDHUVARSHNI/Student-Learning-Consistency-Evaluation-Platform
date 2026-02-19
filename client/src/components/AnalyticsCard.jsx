import React from 'react';
import { Activity, Clock, Trophy } from 'lucide-react';

const AnalyticsCard = ({ data }) => {
    const { totalHours, consistencyScore, totalActivities } = data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Total Study Hours</p>
                    <h3 className="text-2xl font-bold">{totalHours} hrs</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                    <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Consistency Score</p>
                    <h3 className="text-2xl font-bold">{consistencyScore}%</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <Activity className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Total Activities</p>
                    <h3 className="text-2xl font-bold">{totalActivities}</h3>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCard;
