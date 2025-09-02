import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutUser, uploadProfilePicture } from '../../ReduxStore/slices/authSlice';
import authApi from '../../api/authApi';

const Navbar = ({ handleLogout }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const defaultHandleLogout = async () => {
    try {
      await authApi.logout();
      dispatch(logoutUser());
      localStorage.removeItem('accessToken');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
      console.error(error);
    }
  };

  const onLogout = handleLogout || defaultHandleLogout;

  const getDashboardLink = () => {
    const role = user?.role?.toLowerCase();
    if (role) {
      return { path: '/profile', label: 'Profile' }; 
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await dispatch(uploadProfilePicture(formData)).unwrap();
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Failed to update profile picture');
      console.error(error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <nav className="bg-blue-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <NavLink to="/" className="text-xl font-bold">
          Gas Agency
        </NavLink>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-2">
                <img
                  src={user?.profilePicture || 'https://placehold.co/32'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover cursor-pointer"
                  onClick={triggerFileInput}
                  onError={(e) => (e.target.src = 'https://placehold.co/32')}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
                <span className="text-blue-200 text-sm">Welcome, {user?.name || user?.username || 'User'}</span>
              </div>
              <NavLink
                to={getDashboardLink().path}
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-100 underline text-base hover:underline'
                    : 'text-blue-200 text-base hover:text-blue-100 hover:underline transition-colors'
                }
              >
                {getDashboardLink().label}
              </NavLink>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-100 underline text-base hover:underline'
                    : 'text-blue-200 text-base hover:text-blue-100 hover:underline transition-colors'
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-100 underline text-base hover:underline'
                    : 'text-blue-200 text-base hover:text-blue-100 hover:underline transition-colors'
                }
              >
                Signup
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;