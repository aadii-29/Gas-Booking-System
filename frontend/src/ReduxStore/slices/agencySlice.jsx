import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import agencyApi from '../../api/agencyApi';

// Get pending delivery staff applications
export const getPendingDeliveryStaff = createAsyncThunk(
  'agency/getPendingDeliveryStaff',
  async ({ page = 1, limit = 5, AgencyID } = {}, { rejectWithValue }) => {
    try {
      const response = await agencyApi.getPendingDeliveryStaffApplications({ page, limit, AgencyID });
      console.log('getPendingDeliveryStaff: Response', JSON.stringify(response.data, null, 2));
      if (response.status === 200 && response.data) {
        return {
          count: response.data.count,
          totalCount: response.data.totalCount,
          currentPage: response.data.currentPage || page,
          totalPages: response.data.totalPages,
          limit: response.data.limit || limit,
          applications: response.data.applications,
        };
      }
      return rejectWithValue(response.data.message || 'Failed to fetch pending delivery staff applications');
    } catch (error) {
      console.error('getPendingDeliveryStaff error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || 'Failed to fetch pending delivery staff applications';
      if (error.response?.status === 403) {
        return rejectWithValue('Unauthorized: Invalid role or AgencyID missing');
      } else if (error.response?.status === 404) {
        return rejectWithValue(`Agency not found for AgencyID: ${AgencyID || 'unknown'}`);
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Get pending new customers
export const getPendingNewCustomer = createAsyncThunk(
  'agency/getPendingNewCustomer',
  async ({ page = 1, limit = 5, AgencyID } = {}, { rejectWithValue }) => {
    try {
      const response = await agencyApi.getPendingCustomerApplications({ page, limit, AgencyID });
      console.log('getPendingNewCustomer: Response', JSON.stringify(response.data, null, 2));
      if (response.status === 200 && response.data) {
        return {
          count: response.data.count,
          totalCount: response.data.totalCount,
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          limit: response.data.limit,
          customers: response.data.customers,
        };
      }
      return rejectWithValue(response.data.message || 'Failed to fetch pending customers');
    } catch (error) {
      console.error('getPendingNewCustomer error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage = error.response?.data?.message || 'Failed to fetch pending customers';
      if (error.response?.status === 403) {
        return rejectWithValue('Unauthorized: Invalid role or AgencyID missing');
      } else if (error.response?.status === 404) {
        return rejectWithValue(`Agency not found for AgencyID: ${AgencyID || 'unknown'}`);
      }
      return rejectWithValue(errorMessage);
    }
  }
);



// View delivery staff applications
export const viewDeliveryStaffApplications = createAsyncThunk(
  'agency/viewDeliveryStaffApplications',
  async ({ Approval_Status, AgencyID }, { rejectWithValue }) => {
    try {
      const response = await agencyApi.viewDeliveryStaffApplications({ Approval_Status, AgencyID });
      console.log('viewDeliveryStaffApplications: Response', JSON.stringify(response.data, null, 2));
      if (response.status === 200 && response.data) {
        return {
          count: response.data.count,
          applications: response.data.applications,
        };
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      console.error('viewDeliveryStaffApplications error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery staff applications');
    }
  }
);

// Update delivery staff application status
export const updateDeliveryStaffStatus = createAsyncThunk(
  'agency/updateDeliveryStaffStatus',
  async ({ ApplicationID, Approval_Status, comments }, { rejectWithValue }) => {
    try {
      const response = await agencyApi.updateDeliveryStaffStatus(ApplicationID, { Approval_Status, comments });
      console.log('updateDeliveryStaffStatus: Raw Response', JSON.stringify(response, null, 2));
      if (response.status === 200) {
        console.log('updateDeliveryStaffStatus: Success', {
          status: response.status,
          data: response.data,
        });
        return response.data;
      }
      console.error('updateDeliveryStaffStatus: Failed', {
        status: response.status,
        data: response.data,
        message: response.data?.message || 'Failed to update delivery staff status',
      });
      return rejectWithValue(response.data?.message || 'Failed to update delivery staff status');
    } catch (error) {
      console.error('updateDeliveryStaffStatus error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update delivery staff status';
      return rejectWithValue({
        message: errorMessage,
        status: error.response?.status,
      });
    }
  }
);

// Update customer by CustomerID
export const updateCustomerByCustomerID = createAsyncThunk(
  'agency/updateCustomerByCustomerID',
  async ({ CustomerID, updates }, { rejectWithValue }) => {
    try {
      const response = await agencyApi.updateCustomerByCustomerID({ CustomerID, updates });
      console.log('updateCustomerByCustomerID: Response', JSON.stringify(response.data, null, 2));
      if (response.status === 200 && response.data) {
        return response.data.customer;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      console.error('updateCustomerByCustomerID error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

// Delete customer by CustomerID
export const deleteCustomerByCustomerID = createAsyncThunk(
  'agency/deleteCustomerByCustomerID',
  async ({ CustomerID }, { rejectWithValue }) => {
    try {
      const response = await agencyApi.deleteCustomerByCustomerID({ CustomerID });
      console.log('deleteCustomerByCustomerID: Response', JSON.stringify(response.data, null, 2));
      if (response.status === 200 && response.data) {
        return { CustomerID };
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      console.error('deleteCustomerByCustomerID error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
    }
  }
);

// View customer by CustomerID
export const viewCustomerByCustomerID = createAsyncThunk(
  'agency/viewCustomerByCustomerID',
  async ({ CustomerID, fields }, { rejectWithValue }) => {
    try {
      const response = await agencyApi.viewCustomerByCustomerID({ CustomerID, fields });
      console.log('viewCustomerByCustomerID: Response', JSON.stringify(response.data, null, 2));
      if (response.status === 200 && response.data) {
        return response.data.customer;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      console.error('viewCustomerByCustomerID error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
    }
  }
);

// View customers by AgencyID
export const viewCustomersByAgencyID = createAsyncThunk(
  'agency/viewCustomersByAgencyID',
  async ({ AgencyID, page, limit, fields }, { rejectWithValue }) => {
    try {
      const response = await agencyApi.viewCustomersByAgencyID({ AgencyID, page, limit, fields });
      console.log('viewCustomersByAgencyID: Response', JSON.stringify(response.data, null, 2));
      if (response.status === 200 && response.data) {
        return {
          pagination: response.data.pagination,
          count: response.data.count,
          customers: response.data.customers,
        };
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      console.error('viewCustomersByAgencyID error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

// Update customer status
export const updateCustomerStatus = createAsyncThunk(
  'agency/updateCustomerStatus',
  async ({ registrationId, status, comments }, { rejectWithValue }) => {
    try {
      const response = await agencyApi.updateCustomerStatus(registrationId, { status, comments });
      console.log('updateCustomerStatus: Raw Response', JSON.stringify(response, null, 2));
      if (response.status === 200) {
        console.log('updateCustomerStatus: Success', {
          status: response.status,
          data: response.data,
        });
        return response.data;
      }
      console.error('updateCustomerStatus: Failed', {
        status: response.status,
        data: response.data,
        message: response.data?.message || 'Failed to update customer status',
      });
      return rejectWithValue(response.data?.message || 'Failed to update customer status');
    } catch (error) {
      console.error('updateCustomerStatus: Error', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update customer status';
      return rejectWithValue({
        message: errorMessage,
        status: error.response?.status,
      });
    }
  }
);

// Update agency status
export const updateAgencyStatus = createAsyncThunk(
  'agency/updateAgencyStatus',
  async ({ registrationID, status, approvedBy }, { rejectWithValue }) => {
    try {
      const response = await agencyApi.updateAgencyStatus({ registrationID, status, approvedBy });
      console.log('updateAgencyStatus: Response', JSON.stringify(response.data, null, 2));
      if (response.status === 200 && response.data) {
        return {
          agencyID: response.data.agencyID,
          status,
        };
      }
      return rejectWithValue(response.data.message || response.data.error);
    } catch (error) {
      console.error('updateAgencyStatus error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to update agency status');
    }
  }
);

// Get agency details
export const getAgencyDetails = createAsyncThunk(
  'agency/getAgencyDetails',
  async ({ agencyID }, { rejectWithValue }) => {
    try {
      const response = await agencyApi.getAgencyDetails({ agencyID });
      console.log('getAgencyDetails: Response', JSON.stringify(response.data, null, 2));
      if (response.status === 200 && response.data) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || response.data.error);
    } catch (error) {
      console.error('getAgencyDetails error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch agency details');
    }
  }
);

const agencySlice = createSlice({
  name: 'agency',
  initialState: {
    deliveryStaffApplications: {
      count: 0,
      applications: [],
    },
    pendingDeliveryStaff: {
      applications: [],
      count: 0,
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 5,
      loading: false,
      error: null,
    },
    pendingCustomers: {
      customers: [],
      count: 0,
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 5,
      loading: false,
      error: null,
    },
    singleStaff: null,
    customers: {
      pagination: {
        totalCustomers: 0,
        currentPage: 1,
        totalPages: 1,
        customersPerPage: 5,
      },
      count: 0,
      customers: [],
    },
    agencyDetails: null,
    approvalDetails: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPendingDeliveryStaff.pending, (state) => {
        state.pendingDeliveryStaff.loading = true;
        state.pendingDeliveryStaff.error = null;
      })
      .addCase(getPendingDeliveryStaff.fulfilled, (state, action) => {
        state.pendingDeliveryStaff.loading = false;
        state.pendingDeliveryStaff.applications = action.payload.applications;
        state.pendingDeliveryStaff.count = action.payload.count;
        state.pendingDeliveryStaff.totalCount = action.payload.totalCount;
        state.pendingDeliveryStaff.currentPage = action.payload.currentPage;
        state.pendingDeliveryStaff.totalPages = action.payload.totalPages;
        state.pendingDeliveryStaff.limit = action.payload.limit;
      })
      .addCase(getPendingDeliveryStaff.rejected, (state, action) => {
        state.pendingDeliveryStaff.loading = false;
        state.pendingDeliveryStaff.error = action.payload;
      })
      .addCase(getPendingNewCustomer.pending, (state) => {
        state.pendingCustomers.loading = true;
        state.pendingCustomers.error = null;
      })
      .addCase(getPendingNewCustomer.fulfilled, (state, action) => {
        state.pendingCustomers.loading = false;
        state.pendingCustomers.customers = action.payload.customers;
        state.pendingCustomers.count = action.payload.count;
        state.pendingCustomers.totalCount = action.payload.totalCount;
        state.pendingCustomers.currentPage = action.payload.currentPage;
        state.pendingCustomers.totalPages = action.payload.totalPages;
        state.pendingCustomers.limit = action.payload.limit;
      })
      .addCase(getPendingNewCustomer.rejected, (state, action) => {
        state.pendingCustomers.loading = false;
        state.pendingCustomers.error = action.payload;
      })
      
      .addCase(viewDeliveryStaffApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(viewDeliveryStaffApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryStaffApplications = action.payload;
      })
      .addCase(viewDeliveryStaffApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDeliveryStaffStatus.pending, (state) => {
        state.pendingDeliveryStaff.loading = true;
        state.pendingDeliveryStaff.error = null;
      })
      .addCase(updateDeliveryStaffStatus.fulfilled, (state, action) => {
        state.pendingDeliveryStaff.loading = false;
        const updatedStaff = action.payload.deliveryStaff;
        state.approvalDetails = updatedStaff;
        const appIndex = state.deliveryStaffApplications.applications.findIndex(
          (app) => app.ApplicationID === updatedStaff.ApplicationID
        );
        if (appIndex !== -1) {
          state.deliveryStaffApplications.applications[appIndex] = {
            ...state.deliveryStaffApplications.applications[appIndex],
            ...updatedStaff,
          };
        } else {
          state.deliveryStaffApplications.applications.push(updatedStaff);
          state.deliveryStaffApplications.count += 1;
        }
        const pendingIndex = state.pendingDeliveryStaff.applications.findIndex(
          (app) => app.ApplicationID === updatedStaff.ApplicationID
        );
        if (pendingIndex !== -1) {
          if (updatedStaff.Approval_Status !== 'Pending') {
            state.pendingDeliveryStaff.applications.splice(pendingIndex, 1);
            state.pendingDeliveryStaff.count -= 1;
            state.pendingDeliveryStaff.totalCount -= 1;
          } else {
            state.pendingDeliveryStaff.applications[pendingIndex] = {
              ...state.pendingDeliveryStaff.applications[pendingIndex],
              Approval_Status: updatedStaff.Approval_Status,
            };
          }
        }
        if (state.singleStaff && state.singleStaff.ApplicationID === updatedStaff.ApplicationID) {
          state.singleStaff = {
            ...state.singleStaff,
            Approval_Status: updatedStaff.Approval_Status,
          };
        }
      })
      .addCase(updateDeliveryStaffStatus.rejected, (state, action) => {
        state.pendingDeliveryStaff.loading = false;
        state.pendingDeliveryStaff.error = action.payload.message;
      })
      .addCase(updateCustomerByCustomerID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerByCustomerID.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCustomer = action.payload;
        const index = state.customers.customers.findIndex(
          (c) => c.CustomerID === updatedCustomer.CustomerID
        );
        if (index !== -1) {
          state.customers.customers[index] = updatedCustomer;
        } else {
          state.customers.customers.push(updatedCustomer);
          state.customers.count += 1;
        }
      })
      .addCase(updateCustomerByCustomerID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCustomerByCustomerID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomerByCustomerID.fulfilled, (state, action) => {
        state.loading = false;
        const { CustomerID } = action.payload;
        state.customers.customers = state.customers.customers.filter(
          (c) => c.CustomerID !== CustomerID
        );
        state.customers.count -= 1;
        state.pendingCustomers.customers = state.pendingCustomers.customers.filter(
          (c) => c.id !== CustomerID
        );
        state.pendingCustomers.count = state.pendingCustomers.customers.length;
      })
      .addCase(deleteCustomerByCustomerID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(viewCustomerByCustomerID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(viewCustomerByCustomerID.fulfilled, (state, action) => {
        state.loading = false;
        const customer = action.payload;
        const index = state.customers.customers.findIndex(
          (c) => c.CustomerID === customer.CustomerID
        );
        if (index !== -1) {
          state.customers.customers[index] = customer;
        } else {
          state.customers.customers.push(customer);
          state.customers.count += 1;
        }
      })
      .addCase(viewCustomerByCustomerID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(viewCustomersByAgencyID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(viewCustomersByAgencyID.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(viewCustomersByAgencyID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCustomerStatus.pending, (state) => {
        state.pendingCustomers.loading = true;
        state.pendingCustomers.error = null;
      })
      .addCase(updateCustomerStatus.fulfilled, (state, action) => {
        state.pendingCustomers.loading = false;
        const updatedCustomer = action.payload.data;
        state.approvalDetails = updatedCustomer;
        const customerIndex = state.customers.customers.findIndex(
          (c) => c.CustomerID === updatedCustomer.CustomerID
        );
        if (customerIndex !== -1) {
          state.customers.customers[customerIndex] = {
            ...state.customers.customers[customerIndex],
            Approval_Status: updatedCustomer.Approval_Status,
            Approval_Date: updatedCustomer.Approval_Date,
            Approved_By: updatedCustomer.Approved_By,
          };
        }
        const pendingIndex = state.pendingCustomers.customers.findIndex(
          (c) => c.id === updatedCustomer.RegistrationID
        );
        if (pendingIndex !== -1) {
          if (updatedCustomer.Approval_Status !== 'Pending') {
            state.pendingCustomers.customers.splice(pendingIndex, 1);
            state.pendingCustomers.count -= 1;
            state.pendingCustomers.totalCount -= 1;
          } else {
            state.pendingCustomers.customers[pendingIndex] = {
              ...state.pendingCustomers.customers[pendingIndex],
              status: updatedCustomer.Approval_Status,
            };
          }
        }
      })
      .addCase(updateCustomerStatus.rejected, (state, action) => {
        state.pendingCustomers.loading = false;
        state.pendingCustomers.error = action.payload.message;
      })
      .addCase(updateAgencyStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgencyStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 'Approved' && state.agencyDetails) {
          state.agencyDetails.Approval_Status = 'Approved';
          state.agencyDetails.AgencyID = action.payload.agencyID;
        } else if (action.payload.status === 'Denied' && state.agencyDetails) {
          state.agencyDetails.Approval_Status = 'Denied';
        }
      })
      .addCase(updateAgencyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAgencyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAgencyDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.agencyDetails = action.payload;
      })
      .addCase(getAgencyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = agencySlice.actions;
export default agencySlice.reducer;