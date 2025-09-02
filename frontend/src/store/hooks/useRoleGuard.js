import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const useRoleGuard = (allowedRoles = []) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      navigate('/unauthorized');
    }
  }, [user, allowedRoles, navigate]);
};

export default useRoleGuard;
