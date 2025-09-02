import axiosInstance from './axiosInstance';

export const getConnectionDetails = async (customerId) => {
  return axiosInstance.get(`/customer/${customerId}/connection`);
};