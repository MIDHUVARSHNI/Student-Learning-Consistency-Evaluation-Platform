import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    students: [],
    educators: [],
    studentAnalytics: null,
    isStatsLoading: false,
    isAnalyticsLoading: false,
    isEducatorsLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
};

// Get student stats
export const getStudentStats = createAsyncThunk(
    'educator/getStudentStats',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get('http://localhost:5000/api/educator/students', config);
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get specific student analytics
export const getStudentAnalytics = createAsyncThunk(
    'educator/getStudentAnalytics',
    async (studentId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            console.log(`Slice: Calling API for student ${studentId}`);
            const response = await axios.get(`http://localhost:5000/api/educator/student/${studentId}/analytics`, config);
            console.log('Slice: API Response received', response.data);
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get list of educators
export const getEducators = createAsyncThunk(
    'educator/getEducators',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get('http://localhost:5000/api/educator/list', config);
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const educatorSlice = createSlice({
    name: 'educator',
    initialState,
    reducers: {
        reset: (state) => {
            state.isStatsLoading = false;
            state.isAnalyticsLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
            state.students = [];
            state.studentAnalytics = null;
        },
        resetAnalytics: (state) => {
            state.studentAnalytics = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStudentStats.pending, (state) => {
                state.isStatsLoading = true;
            })
            .addCase(getStudentStats.fulfilled, (state, action) => {
                state.isStatsLoading = false;
                state.isSuccess = true;
                state.students = action.payload;
            })
            .addCase(getStudentStats.rejected, (state, action) => {
                state.isStatsLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getStudentAnalytics.pending, (state) => {
                state.isAnalyticsLoading = true;
            })
            .addCase(getStudentAnalytics.fulfilled, (state, action) => {
                state.isAnalyticsLoading = false;
                state.isSuccess = true;
                state.studentAnalytics = action.payload;
            })
            .addCase(getStudentAnalytics.rejected, (state, action) => {
                state.isAnalyticsLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getEducators.pending, (state) => {
                state.isEducatorsLoading = true;
            })
            .addCase(getEducators.fulfilled, (state, action) => {
                state.isEducatorsLoading = false;
                state.educators = action.payload;
            })
            .addCase(getEducators.rejected, (state, action) => {
                state.isEducatorsLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset, resetAnalytics } = educatorSlice.actions;
export default educatorSlice.reducer;
