import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    feedbacks: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Send feedback (Educator only)
export const sendFeedback = createAsyncThunk(
    'feedback/send',
    async (feedbackData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.post('http://localhost:5000/api/feedback', feedbackData, config);
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get feedback (Student only)
export const getFeedback = createAsyncThunk(
    'feedback/getAll',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get('http://localhost:5000/api/feedback', config);
            return response.data;
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendFeedback.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(sendFeedback.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Optionally update state if needed, but for now we might just want to show success message
            })
            .addCase(sendFeedback.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getFeedback.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getFeedback.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.feedbacks = action.payload;
            })
            .addCase(getFeedback.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = feedbackSlice.actions;
export default feedbackSlice.reducer;
