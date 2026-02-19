import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import activityReducer from './slices/activitySlice';
import analyticsReducer from './slices/analyticsSlice';
import educatorReducer from './slices/educatorSlice';
import feedbackReducer from './slices/feedbackSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        activities: activityReducer,
        analytics: analyticsReducer,
        educator: educatorReducer,
        feedback: feedbackReducer,
    },
});
