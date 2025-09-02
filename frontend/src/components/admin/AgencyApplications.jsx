import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingAgencyApplications } from '../../ReduxStore/slices/adminSlice'; // Adjust import based on your slice
import { toast } from 'react-toastify';

const AgencyApplications = () => {
  const dispatch = useDispatch();
  const { applications, isLoading, error } = useSelector((state) => state.agency || {});

  useEffect(() => {
    dispatch(fetchPendingAgencyApplications());
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading applications...</div>;
  }

  if (error) {
    toast.error(error);
    return <div>Error: {error}</div>;
  }

  // Check if applications is defined and is an array
  const applicationList = Array.isArray(applications) ? applications : [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Agency Applications</h2>
      {applicationList.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicationList.map((app) => (
              <tr key={app.id} className="border">
                <td className="border p-2">{app.id}</td>
                <td className="border p-2">{app.name}</td>
                <td className="border p-2">{app.status}</td>
                <td className="border p-2">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AgencyApplications;