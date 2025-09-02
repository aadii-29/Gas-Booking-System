import axiosInstance from './axiosInstance';

export const getPendingAgencyApplications = async () => {
  return axiosInstance.get('/admin/agency-applications');
};

export const approveAgencyApplication = async (applicationId) => {
  return axiosInstance.post(`/admin/agency-applications/${applicationId}/approve`);
};

export const getAgencies = async () => {
  return axiosInstance.get('/admin/agencies');
};