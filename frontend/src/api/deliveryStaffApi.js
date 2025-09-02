import axiosInstance from './axiosInstance';

export const getDeliveryAssignments = async (staffId) => {
  return axiosInstance.get(`/delivery-staff/${staffId}/assignments`);
};

export const updateDeliveryStatus = async (deliveryId, status) => {
  return axiosInstance.post(`/delivery-staff/assignments/${deliveryId}`, { status });
};