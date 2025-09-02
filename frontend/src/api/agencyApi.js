import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../utils/constants';

const agencyApi = {
  getPendingCustomerApplications: ({ page = 1, limit = 10, AgencyID } = {}) => {
    const endpoint = API_ENDPOINTS.AGENCY.PENDING_CUSTOMER_APPLICATIONS;
    console.log('Sending getPendingCustomerApplications request:', { endpoint, page, limit, AgencyID });
    return axiosInstance.get(endpoint, { params: { page, limit, AgencyID } }).catch((error) => {
      console.error('getPendingCustomerApplications error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    });
  },
  getPendingDeliveryStaffApplications: ({ page = 1, limit = 10, AgencyID } = {}) => {
    const endpoint = API_ENDPOINTS.AGENCY.PENDING_DELIVERY_STAFF_APPLICATIONS;
    console.log('Sending getPendingDeliveryStaffApplications request:', { endpoint, page, limit, AgencyID });
    return axiosInstance.get(endpoint, { params: { page, limit, AgencyID } }).catch((error) => {
      console.error('getPendingDeliveryStaffApplications error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    });
  },
  approveCustomerApplication: (applicationId, agencyId) => {
    const endpoint = API_ENDPOINTS.AGENCY.APPROVE_CUSTOMER_APPLICATION
      .replace(':agencyId', agencyId)
      .replace(':applicationId', applicationId);
    console.log('Sending approveCustomerApplication request:', {
      endpoint,
      applicationId,
      agencyId,
    });
    return axiosInstance.post(endpoint).catch((error) => {
      console.error('approveCustomerApplication error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    });
  },
 
  getCustomers: (agencyId, { page = 1, limit = 5, fields = [] } = {}) => {
    const endpoint = API_ENDPOINTS.AGENCY.CUSTOMERS.replace(':agencyId', agencyId);
    console.log('Sending getCustomers request:', {
      endpoint,
      agencyId,
      page,
      limit,
      fields,
    });
    return axiosInstance.post(endpoint, { AgencyID: agencyId, page, limit, fields }).catch((error) => {
      console.error('getCustomers error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    });
  },
  updateCustomerStatus: (registrationId, { status, comments = '' } = {}) => {
    if (!registrationId) {
      throw new Error('registrationId is required');
    }
    if (!status) {
      throw new Error('status is required');
    }
    if (!['Approved', 'Denied'].includes(status)) {
      throw new Error('status must be either "Approved" or "Denied"');
    }
    const endpoint = API_ENDPOINTS.AGENCY.CUSTOMER_STATUS.replace(':registrationId', registrationId);
    const payload = { status, comments: comments || undefined };
    console.log('Sending updateCustomerStatus request:', {
      endpoint,
      registrationId,
      status,
      comments,
      headers: axiosInstance.defaults.headers.common,
    });
    return axiosInstance
      .put(endpoint, payload)
      .then((response) => {
        console.log('updateCustomerStatus success:', {
          status: response.status,
          data: response.data,
        });
        return response;
      })
      .catch((error) => {
        const errorDetails = {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          headers: error.response?.headers,
          config: error.config,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        };
        console.error('updateCustomerStatus error:', errorDetails);
        throw error;
      });
  },
  updateDeliveryStaffStatus: (applicationId, { Approval_Status, comments = '' } = {}) => {
    if (!applicationId) {
      throw new Error('applicationId is required');
    }
    if (!Approval_Status) {
      throw new Error('Approval_Status is required');
    }
    if (!['Approved', 'Denied'].includes(Approval_Status)) {
      throw new Error('Approval_Status must be either "Approved" or "Denied"');
    }
    const endpoint = API_ENDPOINTS.AGENCY.DELIVERY_STAFF_STATUS.replace(':ApplicationID', applicationId);
    const payload = { Approval_Status, comments: comments || undefined };
    console.log('Sending updateDeliveryStaffStatus request:', {
      endpoint,
      applicationId,
      Approval_Status,
      comments,
      headers: axiosInstance.defaults.headers.common,
    });
    return axiosInstance
      .put(endpoint, payload)
      .then((response) => {
        console.log('updateDeliveryStaffStatus success:', {
          status: response.status,
          data: response.data,
        });
        return response;
      })
      .catch((error) => {
        const errorDetails = {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          headers: error.response?.headers,
          config: error.config,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        };
        console.error('updateDeliveryStaffStatus error:', errorDetails);
        throw error;
      });
  },
  getAgencyDetails: (agencyId) => {
    const endpoint = API_ENDPOINTS.AGENCY.AGENCY_DETAILS.replace(':agencyId', agencyId);
    console.log('Sending getAgencyDetails request:', {
      endpoint,
      agencyId,
    });
    return axiosInstance.get(endpoint).catch((error) => {
      console.error('getAgencyDetails error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    });
  },
  viewDeliveryStaffApplications: ({ Approval_Status, AgencyID }) => {
    if (!AgencyID) {
      throw new Error('AgencyID is required');
    }
    const endpoint = API_ENDPOINTS.AGENCY.PENDING_DELIVERY_STAFF_APPLICATIONS.replace(':agencyId', AgencyID);
    console.log('Sending viewDeliveryStaffApplications request:', {
      endpoint,
      AgencyID,
      Approval_Status,
    });
    return axiosInstance
      .get(endpoint, { params: { Approval_Status } })
      .then((response) => {
        console.log('viewDeliveryStaffApplications success:', {
          status: response.status,
          data: response.data,
        });
        return response.data;
      })
      .catch((error) => {
        console.error('viewDeliveryStaffApplications error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          headers: error.response?.headers,
          config: error.config,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
        throw error;
      });
  },
};

export default agencyApi;
export const {
  getPendingCustomerApplications,
  approveCustomerApplication,
  getPendingDeliveryStaffApplications,
  
  getCustomers,
  updateCustomerStatus,
  updateDeliveryStaffStatus,
  getAgencyDetails,
  viewDeliveryStaffApplications,
} = agencyApi;