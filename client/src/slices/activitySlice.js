import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosConfig';

const initialState = {
    activities: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Create new activity
export const createActivity = createAsyncThunk(
    'activities/create',
    async (activityData, thunkAPI) => {
        try {
            const response = await axiosInstance.post('/activities', activityData);
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get user activities
export const getActivities = createAsyncThunk(
    'activities/getAll',
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get('/activities');
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete activity
export const deleteActivity = createAsyncThunk(
    'activities/delete',
    async (id, thunkAPI) => {
        try {
            await axiosInstance.delete(`/activities/${id}`);
            return id;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const activitySlice = createSlice({
    name: 'activity',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(createActivity.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createActivity.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.activities.push(action.payload);
            })
            .addCase(createActivity.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getActivities.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getActivities.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.activities = action.payload;
            })
            .addCase(getActivities.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteActivity.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteActivity.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.activities = state.activities.filter(
                    (activity) => activity._id !== action.payload
                );
            })
            .addCase(deleteActivity.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = activitySlice.actions;
export default activitySlice.reducer;
