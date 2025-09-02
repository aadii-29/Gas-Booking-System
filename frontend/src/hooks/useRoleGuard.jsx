import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const useRoleGaurd = (allowedRoles = []) => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access this page');
      navigate('/login');
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      toast.error('You do not have permission to access this page');
      navigate('/'); // Redirect to home or a fallback route
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  return { isAuthenticated, user };
};

export default useRoleGaurd;