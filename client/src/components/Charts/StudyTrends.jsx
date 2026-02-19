import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudyTrends = ({ data }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-bold mb-4">Weekly Study Trends (Minutes)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="minutes" fill="#8884d8" name="Study Time" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StudyTrends;
