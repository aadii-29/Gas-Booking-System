import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo, logoutUser } from '../ReduxStore/slices/authSlice';
import { useNavigate, Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(!user && token);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('DashboardLayout - Redirecting to /login');
      navigate('/login');
      return;
    }

    if (!user && token) {
      console.log('DashboardLayout - Fetching user info');
      dispatch(fetchUserInfo())
        .unwrap()
        .then(() => {
          console.log('DashboardLayout - User info fetched');
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch user info:', error);
          dispatch(logoutUser());
          navigate('/login');
        });
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, token, dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar handleLogout={handleLogout} />
        <main className="max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;