import React from 'react';
import { useSelector } from 'react-redux';
import ConnectionDetails from './ConnectionDetails';

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <p className="mb-6">Welcome, {user?.name || 'Customer'}!</p>
      <ConnectionDetails />
    </div>
  );
};

export default CustomerDashboard;