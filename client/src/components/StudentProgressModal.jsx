import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentAnalytics, resetAnalytics } from '../slices/educatorSlice';
import AnalyticsCard from './AnalyticsCard';
import StudyTrends from './Charts/StudyTrends';
import SubjectDistribution from './Charts/SubjectDistribution';
import Heatmap from './Charts/Heatmap';
import GoalProgress from './GoalProgress';
import { X } from 'lucide-react';

const StudentProgressModal = ({ studentId, studentName, onClose }) => {
    const dispatch = useDispatch();
    const { studentAnalytics, isAnalyticsLoading, isError, message } = useSelector((state) => state.educator);

    useEffect(() => {
        dispatch(getStudentAnalytics(studentId));

        return () => {
            dispatch(resetAnalytics());
        };
    }, [dispatch, studentId]);

    if (isAnalyticsLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-[60]">
                <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-xl font-bold text-gray-800">Updating Progress for {studentName}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto pt-20 pb-10">
            <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
                <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Progress: {studentName}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-8 w-8" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {studentAnalytics ? (
                        <>
                            <AnalyticsCard data={studentAnalytics} />
                            <GoalProgress
                                currentProgress={studentAnalytics.goalProgress}
                                weeklyGoal={studentAnalytics.weeklyGoal}
                                currentHours={studentAnalytics.currentWeekHours}
                                remainingHours={studentAnalytics.remainingHours}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <StudyTrends data={studentAnalytics.weeklyData} />
                                <SubjectDistribution data={studentAnalytics.subjectData} />
                            </div>
                            <Heatmap data={studentAnalytics.heatmapData} />
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500 mb-2">No data available for this student.</p>
                            {isError && <p className="text-red-500 text-sm">Error: {message}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProgressModal;
