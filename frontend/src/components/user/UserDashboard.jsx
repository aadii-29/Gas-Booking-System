import React from 'react';
import { useSelector } from 'react-redux';
import CallToAction from './CallToAction';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 bg-gradient-to-r from-blue-50 to-blue-200 rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold text-center text-blue-800 mb-4">
        Welcome, {user?.username || 'User'}!
      </h1>
      <p className="text-lg text-center text-blue-700 mb-6">
        Your personalized dashboard is ready. Start exploring the services!
      </p>
      <div className="bg-blue-800 text-white p-6 rounded-xl shadow-md w-full text-center">

        <p className="text-md">Choose your path to join the network.</p>
        <CallToAction />
      </div>
    </div>
  );
};

export default UserDashboard;