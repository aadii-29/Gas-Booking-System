import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../utils/constants';

const userApi = {
  applyAgency: (data) => axiosInstance.post(API_ENDPOINTS.USER.APPLY_AGENCY, data),

  applyCustomer: (data) => {
    console.log('Sending applyCustomer request:', {
      endpoint: API_ENDPOINTS.USER.APPLY_CUSTOMER,
      data: data instanceof FormData ? 'FormData' : data,
    });
    return axiosInstance.post(API_ENDPOINTS.USER.APPLY_CUSTOMER, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).catch((error) => {
      console.error('applyCustomer error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    });
  },

  applyDeliveryStaff: (data) => {
    console.log('Sending applyDeliveryStaff request:', {
      endpoint: API_ENDPOINTS.USER.APPLY_DELIVERY_STAFF,
      data: data instanceof FormData ? 'FormData' : data,
    });
    return axiosInstance.post(API_ENDPOINTS.USER.APPLY_DELIVERY_STAFF, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).catch((error) => {
      console.error('applyDeliveryStaff error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    });
  },

  checkApplicationStatus: (id) => axiosInstance.get(`${API_ENDPOINTS.USER.CHECK_APPLICATION_STATUS}/${id}`),

  viewApplicationStatus: (data) => {
    console.log('Sending viewApplicationStatus request:', {
      endpoint: API_ENDPOINTS.USER.VIEW_APPLICATION_STATUS_BYID,
      data,
    });
    return axiosInstance.post(API_ENDPOINTS.USER.VIEW_APPLICATION_STATUS_BYID, data).catch((error) => {
      console.error('viewApplicationStatus error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    });
  },

  viewAllDeliveryStaffApplications: () => {
    console.log('Sending viewAllDeliveryStaffApplications request:', {
      endpoint: API_ENDPOINTS.USER.VIEW_APPLICATION_STATUS,
    });
    return axiosInstance.get(API_ENDPOINTS.USER.VIEW_APPLICATION_STATUS).catch((error) => {
      console.error('viewAllDeliveryStaffApplications error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    });
  },

  getAgencies: () => axiosInstance.get(`${API_ENDPOINTS.USER.VIEWAGENCIES}`),

  ViewApplications: () => axiosInstance.get(`${API_ENDPOINTS.USER.VIEWAPPLICATIONS}`),

  getPendingNewCustomer: (agencyID) => {
    console.log('Sending getPendingNewCustomer request:', {
      endpoint: API_ENDPOINTS.USER.PENDING_CUSTOMERS,
      agencyID,
    });
    return axiosInstance.post(API_ENDPOINTS.USER.PENDING_CUSTOMERS, { AgencyID: agencyID }).catch((error) => {
      console.error('getPendingNewCustomer error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    });
  },
};

export default userApi;
export const {
  applyAgency,
  applyCustomer,
  applyDeliveryStaff,
  checkApplicationStatus,
  viewApplicationStatus,
  viewAllDeliveryStaffApplications,
  getAgencies,
  ViewApplications,
  getPendingNewCustomer, // Export the new function
} = userApi;