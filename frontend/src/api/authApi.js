import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../utils/constants';

export const signup = (data) =>
  axiosInstance.post(API_ENDPOINTS.AUTH.SIGNUP, data).then((response) => {
    console.log('authApi.signup: Response', response.data);
    return response;
  });

export const login = (data) =>
  axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, data).then((response) => {
      console.log('authApi.login: Response', JSON.stringify(response.data, null, 2));
      return response;
    }).catch((error) => {
      console.error('authApi.login: Error', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    });

export const logout = () =>
  axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT).then((response) => {
    console.log('authApi.logout: Response', response.data);
    return response;
  });

export const forgotPassword = (data) =>
  axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data).then((response) => {
    console.log('authApi.forgotPassword: Response', response.data);
    return response;
  });

export const resetPassword = (data) =>
  axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data).then((response) => {
    console.log('authApi.resetPassword: Response', response.data);
    return response;
  });

export const getUserInfo = () =>
  axiosInstance.get('/auth/userinfo').then((response) => {
      console.log('authApi.getUserInfo: Response', JSON.stringify(response.data, null, 2));
      return response;
    }).catch((error) => {
      console.error('authApi.getUserInfo: Error', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    });

export const uploadProfilePicture = (formData) =>
  axiosInstance.post(API_ENDPOINTS.AUTH.UPLOAD_PROFILE_PICTURE || '/auth/upload-profile-picture', formData).then((response) => {
    console.log('authApi.uploadProfilePicture: Response', response.data);
    return response;
  });

const authApi = {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUserInfo,
  uploadProfilePicture,
};

export default authApi;