import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';

export const fetchApplications = createAsyncThunk(
  'admin/fetchApplications',
  async ({ type }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/applications/${type}`);
      if (response.data.success) {
        return { type, applications: response.data.data };
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
    }
  }
);

export const fetchPendingAgencyApplications = createAsyncThunk(
  'admin/fetchPendingAgencyApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/pending-agencies');
      if (response.data.success) {
        return response.data.data; // Array of pending agencies
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending agency applications');
    }
  }
);

export const approveApplication = createAsyncThunk(
  'admin/approveApplication',
  async ({ type, id, comments }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/agency/status/${id}`, {
        status: 'Approved',
        comments,
      });
      if (response.data.success) {
        return { type, id, data: response.data.data };
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve application');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    agencyApplications: [],
    customerApplications: [],
    deliveryStaffApplications: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchApplications
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state[`${action.payload.type}Applications`] = action.payload.applications;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch applications');
      })
      // fetchPendingAgencyApplications
      .addCase(fetchPendingAgencyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingAgencyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.agencyApplications = action.payload;
      })
      .addCase(fetchPendingAgencyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch pending agency applications');
      })
      // approveApplication
      .addCase(approveApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveApplication.fulfilled, (state, action) => {
        state.loading = false;
        const { type, id, data } = action.payload;
        state[`${type}Applications`] = state[`${type}Applications`].map((app) =>
          app.RegistrationID === id ? data : app
        );
      })
      .addCase(approveApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to approve application');
      });
  },
});

export default adminSlice.reducer;