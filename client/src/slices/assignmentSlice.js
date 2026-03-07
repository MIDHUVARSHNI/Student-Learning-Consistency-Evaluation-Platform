import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../utils/axiosConfig';

const initialState = {
    assignments: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Get assignments
export const getAssignments = createAsyncThunk('assignments/getAll', async (_, thunkAPI) => {
    try {
        const response = await API.get('/assignments');
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Submit assignment
export const submitAssignment = createAsyncThunk('assignments/submit', async ({ id, content }, thunkAPI) => {
    try {
        const response = await API.post(`/assignments/${id}/submit`, { content });
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Create assignment (Educator)
export const createAssignment = createAsyncThunk('assignments/create', async (assignmentData, thunkAPI) => {
    try {
        const response = await API.post('/assignments', assignmentData);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Delete assignment (Educator)
export const deleteAssignment = createAsyncThunk('assignments/delete', async (id, thunkAPI) => {
    try {
        await API.delete(`/assignments/${id}`);
        return id;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const assignmentSlice = createSlice({
    name: 'assignments',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAssignments.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAssignments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.assignments = action.payload;
            })
            .addCase(getAssignments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(submitAssignment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(submitAssignment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Update assignment status locally
                const index = state.assignments.findIndex((a) => a._id === action.payload.assignment);
                if (index !== -1) {
                    state.assignments[index].status = 'submitted';
                    state.assignments[index].submissionDetails = action.payload;
                }
            })
            .addCase(submitAssignment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createAssignment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.assignments.unshift(action.payload);
            })
            .addCase(deleteAssignment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteAssignment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.assignments = state.assignments.filter((a) => a._id !== action.payload);
            })
            .addCase(deleteAssignment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = assignmentSlice.actions;
export default assignmentSlice.reducer;
