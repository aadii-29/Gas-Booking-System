import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser } from '../slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const login = (credentials) => dispatch(loginUser(credentials));
  const logout = () => dispatch(logoutUser());

  const isAuthenticated = !!user;

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  };
};

export default useAuth;
