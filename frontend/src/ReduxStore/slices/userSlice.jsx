import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import userApi from '../../api/userApi';

const fetchUserApplications = createAsyncThunk(
  'user/fetchUserApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.ViewApplications();
      if (response.data.success) {
        return response.data.applications;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch user applications';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const applyForAgency = createAsyncThunk(
  'user/applyForAgency',
  async (data, { rejectWithValue }) => {
    try {
      const response = await userApi.applyAgency(data);
      if (response.data.success) {
        const transformedData = [{
          RegistrationID: response.data.registrationID,
          AgencyName: data.AgencyName,
          AgencyEmail: data.AgencyEmail,
          AgencyMobileNo: data.AgencyMobileNo,
          Gst_NO: data.Gst_NO,
          AgencyAddress: data.AgencyAddress,
          Approval_Status: 'Pending',
          Applied_Date: new Date().toISOString(),
        }];
        return { transformed: transformedData, originalResponse: response.data };
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      let message = error.response?.data?.message || 'Failed to apply for agency';
      if (error.message?.includes('E11000') && error.message?.includes('AgencyEmail')) {
        message = 'Agency email already exists. Please use a different email.';
      }
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const applyForCustomer = createAsyncThunk(
  'user/applyForCustomer',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await userApi.applyCustomer(formData);
      if (response.status === 201 && response.data.customer) {
        return {
          message: response.data.message,
          customer: response.data.customer,
          uploadedDocuments: response.data.uploadedDocuments,
          costBreakdown: response.data.costBreakdown,
        };
      }
      return rejectWithValue(response.data.message || 'Failed to apply for customer');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply for customer';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const applyForDeliveryStaff = createAsyncThunk(
  'user/applyForDeliveryStaff',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await userApi.applyDeliveryStaff(formData);
      if (response.status === 201 && response.data.success) {
        return {
          message: response.data.message || 'Successfully applied for delivery staff',
          deliveryStaff: {
            ApplicationID: response.data.deliveryStaff.ApplicationID,
            AgencyID: response.data.deliveryStaff.AgencyID,
            StaffName: response.data.deliveryStaff.StaffName,
            Approval_Status: response.data.deliveryStaff.Approval_Status,
          },
          uploadedDocuments: response.data.deliveryStaff.Documents,
        };
      }
      return rejectWithValue(response.data.message || 'Failed to apply for delivery staff');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply for delivery staff';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const checkApplicationStatus = createAsyncThunk(
  'user/checkApplicationStatus',
  async (ApplicationID, { rejectWithValue }) => {
    if (!ApplicationID || ApplicationID.trim() === '') {
      const message = 'Application ID is required to check application status';
      toast.error(message);
      return rejectWithValue(message);
    }
    try {
      const response = await userApi.viewApplicationStatus({ ApplicationID });
      if (response.data.success) {
        return response.data.application;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch application status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const fetchAllDeliveryStaffApplications = createAsyncThunk(
  'user/fetchAllDeliveryStaffApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.viewAllDeliveryStaffApplications();
      if (response.data.success) {
        return response.data.applications;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch delivery staff applications';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const fetchAgencies = createAsyncThunk(
  'user/fetchAgencies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getAgencies();
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch agencies';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState: {
    applicationStatus: null,
    agencies: [],
    pendingCustomers: [], // Added to store pending customers
    loading: false,
    error: null,
  },
  reducers: {
    clearApplicationStatus: (state) => {
      state.applicationStatus = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationStatus = action.payload;
      })
      .addCase(fetchUserApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(applyForAgency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyForAgency.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationStatus = action.payload.transformed;
      })
      .addCase(applyForAgency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(applyForCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyForCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationStatus = action.payload;
      })
      .addCase(applyForCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(applyForDeliveryStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyForDeliveryStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationStatus = action.payload;
      })
      .addCase(applyForDeliveryStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkApplicationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationStatus = action.payload;
      })
      .addCase(checkApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllDeliveryStaffApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDeliveryStaffApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applicationStatus = action.payload;
      })
      .addCase(fetchAllDeliveryStaffApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAgencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgencies.fulfilled, (state, action) => {
        state.loading = false;
        state.agencies = action.payload;
      })
      .addCase(fetchAgencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
  },
});

export const { clearApplicationStatus } = userSlice.actions;
export default userSlice.reducer;
export {
  applyForAgency,
  applyForCustomer,
  applyForDeliveryStaff,
  checkApplicationStatus,
  fetchAllDeliveryStaffApplications,
  fetchAgencies,
  fetchUserApplications,

};