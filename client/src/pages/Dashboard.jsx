import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ActivityForm from '../components/ActivityForm';
import ActivityItem from '../components/ActivityItem';
import AnalyticsCard from '../components/AnalyticsCard';
import StudyTrends from '../components/Charts/StudyTrends';
import SubjectDistribution from '../components/Charts/SubjectDistribution';
import Heatmap from '../components/Charts/Heatmap';
import GoalProgress from '../components/GoalProgress';
import FeedbackList from '../components/FeedbackList';
import { getActivities, reset as resetActivities } from '../slices/activitySlice';
import { getAnalyticsData, reset as resetAnalytics } from '../slices/analyticsSlice';
import { logout } from '../slices/authSlice';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { activities, isLoading: activitiesLoading, isError: activitiesError, message: activitiesMessage } = useSelector(
        (state) => state.activities
    );
    const { data: analyticsData, isLoading: analyticsLoading, isError: analyticsError } = useSelector(
        (state) => state.analytics
    );

    useEffect(() => {
        if (activitiesError) {
            console.log(activitiesMessage);
        }

        if (!user) {
            navigate('/login');
        }

        dispatch(getActivities());
        dispatch(getAnalyticsData());

        return () => {
            dispatch(resetActivities());
            dispatch(resetAnalytics());
        };
    }, [user, navigate, activitiesError, activitiesMessage, dispatch]);

    // Refetch analytics when activities list changes (add/delete)
    useEffect(() => {
        if (activities.length > 0 || analyticsData) { // Only fetch if we have reason to believe data changed
            dispatch(getAnalyticsData());
        }
    }, [activities, dispatch]);

    const onLogout = () => {
        dispatch(logout());
        navigate('/login');
    }

    const onRetry = () => {
        dispatch(getActivities());
        dispatch(getAnalyticsData());
    };

    if (activitiesLoading || analyticsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-xl font-bold text-gray-800 animate-pulse mb-8">Loading your Student Analysis...</div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 max-w-sm text-center">
                    <p className="text-sm text-gray-600 mb-4">Taking too long? You might need to re-login or check your connection.</p>
                    <button
                        onClick={onLogout}
                        className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2 w-full"
                    >
                        <LogOut size={16} /> Back to Login Page
                    </button>
                </div>
            </div>
        );
    }

    if (activitiesError || analyticsError) {
        return (
            <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 border-2 border-red-200 p-8 rounded-3xl text-center max-w-lg shadow-xl">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Issue</h2>
                    <p className="text-gray-600 mb-6">
                        We couldn't connect to the server. Please make sure the backend is running and try again.
                    </p>
                    <button
                        onClick={onRetry}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome to Consistify, {user && user.name}</h1>
                <button onClick={onLogout} className="flex items-center text-red-500 hover:text-red-700">
                    <LogOut className="mr-2 h-5 w-5" /> Logout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 space-y-8">
                    {analyticsData && (
                        <>
                            <AnalyticsCard data={analyticsData} />
                            <GoalProgress
                                currentProgress={analyticsData.goalProgress}
                                weeklyGoal={analyticsData.weeklyGoal}
                                currentHours={analyticsData.currentWeekHours}
                                remainingHours={analyticsData.remainingHours}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <StudyTrends data={analyticsData.weeklyData} />
                                <SubjectDistribution data={analyticsData.subjectData} />
                            </div>
                            <Heatmap data={analyticsData.heatmapData} />
                        </>
                    )}

                    <section className="content">
                        <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
                        {activities.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {activities.map((activity) => (
                                    <ActivityItem key={activity._id} activity={activity} />
                                ))}
                            </div>
                        ) : (
                            <h3 className="text-center text-gray-500">You have not set any activities</h3>
                        )}
                    </section>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <FeedbackList />
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Log Activity</h2>
                        <ActivityForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
