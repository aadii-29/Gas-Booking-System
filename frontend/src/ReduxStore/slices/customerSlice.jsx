import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

export const fetchCustomerDetails = createAsyncThunk(
  'customer/fetchCustomerDetails',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/customer/${customerId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer details');
    }
  }
);

export const bookCylinder = createAsyncThunk(
  'customer/bookCylinder',
  async ({ customerId, agencyId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/customer/${customerId}/book-cylinder`, { agencyId });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book cylinder');
    }
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState: {
    details: null,
    bookings: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.details = action.payload;
      })
      .addCase(fetchCustomerDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookCylinder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookCylinder.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(bookCylinder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default customerSlice.reducer;