import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';

// Fetch delivery staff profile by ID
export const fetchDeliveryStaffProfile = createAsyncThunk(
  'deliveryStaff/fetchDeliveryStaffProfile',
  async (staffId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/delivery-staff/${staffId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery staff profile');
    }
  }
);

// Update delivery staff profile
export const updateDeliveryStaffProfile = createAsyncThunk(
  'deliveryStaff/updateDeliveryStaffProfile',
  async ({ staffId, updateData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/delivery-staff/${staffId}`, updateData);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update delivery staff profile');
    }
  }
);

const deliveryStaffSlice = createSlice({
  name: 'deliveryStaff',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchDeliveryStaffProfile
      .addCase(fetchDeliveryStaffProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryStaffProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchDeliveryStaffProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to fetch delivery staff profile');
      })
      // updateDeliveryStaffProfile
      .addCase(updateDeliveryStaffProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeliveryStaffProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateDeliveryStaffProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to update delivery staff profile');
      });
  },
});

export default deliveryStaffSlice.reducer;