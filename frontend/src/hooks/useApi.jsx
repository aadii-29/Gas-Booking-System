import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

  const request = useCallback(
    async ({ method = 'get', url, data = null, headers = {}, isMultipart = false }) => {
      setLoading(true);
      setError(null);

      try {
        const config = {
          method,
          url: `/customer${url}`,
          headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : undefined,
            ...(isMultipart ? { 'Content-Type': 'multipart/form-data' } : {}),
          },
          data,
        };

        const response = await axiosInstance(config);
        setLoading(false);
        return response.data;
      } catch (err) {
        setLoading(false);
        const errorMessage =
          err.response?.data?.message || err.response?.data?.error || 'An error occurred';
        setError(errorMessage);
        toast.error(errorMessage);

        if (err.response?.status === 401) {
          // Optionally dispatch logout or redirect to login
          toast.error('Session expired. Please log in again.');
        }

        throw err;
      }
    },
    [token]
  );

  const clearError = () => setError(null);

  return { request, loading, error, clearError };
};

export default useApi;