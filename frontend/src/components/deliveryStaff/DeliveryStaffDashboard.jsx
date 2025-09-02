import React from 'react';
import { useSelector } from 'react-redux';

const DeliveryStaffDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Delivery Staff Dashboard</h1>
      <p className="mb-6">Welcome, {user?.name || 'Delivery Staff'}!</p>
      {/* Add delivery staff-specific content */}
    </div>
  );
};

export default DeliveryStaffDashboard;