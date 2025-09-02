import axiosInstance from './axiosInstance';

export const forgotPassword = async (email) => {
  return axiosInstance.post('/auth/forgot-password', email);
};

export const resetPassword = async (data) => {
  return axiosInstance.post('/auth/reset-password', data);
};