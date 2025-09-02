import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const DeliveryStaffApprovalResponse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { approvalDetails, loading, error } = useSelector((state) => state.agency);
  const [response, setResponse] = useState(location.state?.response || {});

  useEffect(() => {
    // Prioritize location.state.response
    if (location.state?.response) {
      setResponse(location.state.response);
    }
    // Fallback to approvalDetails from Redux
    else if (approvalDetails && Object.keys(approvalDetails).length > 0) {
      setResponse(approvalDetails);
    }
  }, [location.state, approvalDetails]);

  if (loading) {
    return (
      <div className="p-3 max-w-7xl mx-auto text-center">
        <p className="text-gray-600">Loading approval details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 max-w-7xl mx-auto text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={() => navigate('/agency/application/deliverystaff')}
          className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-base"
        >
          Back to List
        </button>
      </div>
    );
  }

  if (!response || Object.keys(response).length === 0) {
    return (
      <div className="p-3 max-w-7xl mx-auto text-center">
        <p className="text-gray-600 mb-3">No approval details available. Please approve the application first.</p>
        <button
          onClick={() => navigate('/agency/application/deliverystaff')}
          className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-base"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-3xl font-bold text-gray-800">Approval Confirmation</h2>
        <button
          onClick={() => navigate('/agency/application/deliverystaff')}
          className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-base"
        >
          Back to List
        </button>
      </div>
      <div className="bg-white rounded-xl p-3 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Approval Details</h3>
        <table className="w-full border-collapse text-sm">
          <tbody>
            {[
              { label: 'Staff Name', value: response.StaffName || 'N/A' },
              { label: 'Application ID', value: response.ApplicationID || 'N/A' },
              { label: 'Employee ID', value: response.EmployeeID || 'N/A' },
              { label: 'Agency ID', value: response.AgencyID || 'N/A' },
              { label: 'Approval Status', value: response.Approval_Status || 'N/A' },
              { label: 'Status', value: response.Status || 'N/A' },
              { label: 'Approval Date', value: formatDate(response.Approval_Date) },
              { label: 'Created At', value: formatDate(response.createdAt) },
              { label: 'Updated At', value: formatDate(response.updatedAt) },
              { label: 'Approved By', value: `${response.Approved_By?.username || 'N/A'} (${response.Approved_By?.role || 'N/A'})` },
            ].map(({ label, value }) => (
              <tr key={label} className="border-b border-gray-100">
                <td className="py-1 pr-2 font-medium text-gray-700">{label}</td>
                <td className="py-1 text-gray-800">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryStaffApprovalResponse;