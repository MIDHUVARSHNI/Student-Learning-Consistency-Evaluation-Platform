import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    data: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Get analytics data
export const getAnalyticsData = createAsyncThunk(
    'analytics/getData',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get('http://localhost:5000/api/analytics', config);
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAnalyticsData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAnalyticsData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.data = action.payload;
            })
            .addCase(getAnalyticsData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = analyticsSlice.actions;
export default analyticsSlice.reducer;
