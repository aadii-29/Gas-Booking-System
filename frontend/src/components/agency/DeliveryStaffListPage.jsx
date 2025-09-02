import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { FiEye, FiAlertCircle } from 'react-icons/fi';
import { getPendingDeliveryStaff } from '../../ReduxStore/slices/agencySlice';

// Utility function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const DeliveryStaffListPage = () => {
  const dispatch = useDispatch();
  const { pendingDeliveryStaff, loading, error } = useSelector((state) => state.agency);
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Log user details to debug AgencyID
  useEffect(() => {
    console.log('DeliveryStaffListPage: User details', { user, isAuthenticated, AgencyID: user?.AgencyID });
  }, [user, isAuthenticated]);

  // Fetch pending delivery staff
  useEffect(() => {
    if (user?.AgencyID && isAuthenticated) {
      dispatch(getPendingDeliveryStaff({ page, limit, AgencyID: user.AgencyID }));
    } else {
      console.warn('DeliveryStaffListPage: Cannot fetch applications, missing AgencyID or auth', {
        AgencyID: user?.AgencyID,
        isAuthenticated,
      });
    }
  }, [dispatch, user, page, limit, isAuthenticated]);

  // Handle authentication check
  if (!isAuthenticated || !token || !user) {
    console.warn('DeliveryStaffListPage: Redirecting to login due to missing auth', { token, user });
    return <Navigate to="/login" replace />;
  }

  // Handle role check
  if (user.role.toLowerCase() !== 'agency') {
    console.warn('DeliveryStaffListPage: Unauthorized role', { role: user.role });
    return <Navigate to="/unauthorized" replace />;
  }

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pendingDeliveryStaff?.totalPages || 1)) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Delivery Staff Applications</h2>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center">
          <label htmlFor="limit" className="mr-2 text-gray-700 text-sm font-medium">
            Entries per page:
          </label>
          <select
            id="limit"
            value={limit}
            onChange={handleLimitChange}
            className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            aria-label="Select entries per page"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading applications...</span>
        </div>
      ) : error ? (
        <div className="flex items-center text-red-600 bg-red-100 p-4 rounded-md">
          <FiAlertCircle className="mr-2" size={20} />
          <p>{error}</p>
          <button
            onClick={() => dispatch(getPendingDeliveryStaff({ page, limit, AgencyID: user?.AgencyID }))}
            className="ml-4 text-blue-600 hover:underline"
            aria-label="Retry loading applications"
          >
            Retry
          </button>
        </div>
      ) : !pendingDeliveryStaff?.applications?.length ? (
        <p className="text-gray-600 bg-gray-100 p-4 rounded-md">
          No delivery staff applications found.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Applicant Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Application Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDeliveryStaff.applications.map((app) => (
                  <tr key={app.ApplicationID} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800">{app.StaffName || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-800">{formatDate(app.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-800">{app.Approval_Status || 'Pending'}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/agency/application/deliverystaff/${app.ApplicationID}`}
                        className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
                        aria-label={`View details for ${app.StaffName || 'application'}`}
                        title="View Details"
                      >
                        <FiEye size={20} className="mr-1" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <div className="text-gray-600 text-sm">
              Showing {pendingDeliveryStaff.count || 0} of {pendingDeliveryStaff.totalCount || 0} applications
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Previous page"
              >
                Previous
              </button>
              {Array.from({ length: pendingDeliveryStaff.totalPages || 1 }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1.5 border border-gray-300 rounded-md text-sm ${
                    pageNum === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  aria-label={`Go to page ${pageNum}`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === (pendingDeliveryStaff.totalPages || 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStaffListPage;