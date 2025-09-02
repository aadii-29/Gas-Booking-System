import React from 'react';
import { useSelector } from 'react-redux';
import CustomerApplications from './CustomerApplications';
import DeliveryStaffApplications from './DeliveryStaffApplications';


const AgencyDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Agency Dashboard</h1>
      <p className="mb-6">Welcome, {user?.name || 'Agency'}!</p>

      
    </div>
  );
};

export default AgencyDashboard;