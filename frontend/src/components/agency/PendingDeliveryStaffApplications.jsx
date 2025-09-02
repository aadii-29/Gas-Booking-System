
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getPendingDeliveryStaff, updateDeliveryStaffStatus } from '../../ReduxStore/slices/agencySlice';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
          <div className="bg-white p-6 rounded-xl max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-3">{this.state.error.message || 'An unexpected error occurred.'}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.props.navigate('/agency/application/deliverystaff')}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base"
              >
                Back to Applications
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-base"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ErrorBoundaryWithNavigate = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const formatAddress = (address) => {
  if (!address) return 'N/A';
  const { FlatNo, Building_Society_Name, Area, City, State, Pincode } = address;
  return `${FlatNo ? FlatNo + ', ' : ''}${Building_Society_Name ? Building_Society_Name + ', ' : ''}${Area ? Area + ', ' : ''}${City ? City + ', ' : ''}${State ? State + ' ' : ''}${Pincode || ''}`.trim();
};

const PendingDeliveryStaffApplications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { staffId } = useParams();
  const { pendingDeliveryStaff, loading, error } = useSelector((state) => state.agency);
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [denyState, setDenyState] = useState({ staffId: null, comments: '' }); // For denial input

  useEffect(() => {
    if (authLoading) return;
    if (!user?.AgencyID || user?.role?.toLowerCase() !== 'agency') {
      navigate('/unauthorized');
      return;
    }
    dispatch(getPendingDeliveryStaff({ page, limit, AgencyID: user.AgencyID }));
  }, [dispatch, user, authLoading, page, limit, navigate]);

  const handleApprove = async (staffId) => {
    try {
      if (!user?.AgencyID || user?.role?.toLowerCase() !== 'agency') {
        throw new Error('Unauthorized: Agency account required');
      }

      const application = pendingDeliveryStaff.applications.find((app) => app.ApplicationID === staffId);
      if (!application) {
        throw new Error('Application not found');
      }
      if (application.Approval_Status !== 'Pending') {
        throw new Error(`Application is already ${application.Approval_Status}`);
      }

      const action = await dispatch(
        updateDeliveryStaffStatus({
          ApplicationID: staffId,
          Approval_Status: 'Approved',
          comments: 'Approved by agency',
        })
      );

      if (action.meta.requestStatus === 'fulfilled') {
        console.log('Approval payload:', action.payload);
        await dispatch(getPendingDeliveryStaff({ page, limit, AgencyID: user.AgencyID })).unwrap();
        navigate(`/agency/application/deliverystaff/response/${staffId}`, {
          state: { response: action.payload.deliveryStaff || action.payload.data },
        });
      } else {
        throw new Error(action.payload?.message || 'Failed to update delivery staff status');
      }
    } catch (err) {
      const errorMessage = {
        'Delivery staff is already Approved': 'This application has already been approved',
        'Delivery staff is already Denied': 'This application has already been denied',
        'Application not found': 'Application not found',
        'Unauthorized: Only Admins and Agency can approve/deny delivery staff': 'You are not authorized to approve this application',
        'Invalid ApplicationID or status (Approved/Denied) required': 'Invalid application ID or status',
      }[err.message] || (typeof err.message === 'string' ? err.message : 'Failed to approve delivery staff application');

      console.error('handleApprove error:', { message: err.message, staffId });
      alert(errorMessage);
    }
  };

  const handleDeny = (staffId) => {
    setDenyState({ staffId, comments: '' });
  };

  const submitDeny = async () => {
    if (!denyState.comments.trim()) {
      alert('Please provide a reason for denial');
      return;
    }
    try {
      const action = await dispatch(
        updateDeliveryStaffStatus({
          ApplicationID: denyState.staffId,
          Approval_Status: 'Denied',
          comments: denyState.comments,
        })
      );

      if (action.meta.requestStatus === 'fulfilled') {
        await dispatch(getPendingDeliveryStaff({ page, limit, AgencyID: user.AgencyID })).unwrap();
        setDenyState({ staffId: null, comments: '' });
        navigate('/agency/application/deliverystaff');
      } else {
        throw new Error(action.payload?.message || 'Failed to deny delivery staff status');
      }
    } catch (err) {
      const errorMessage = {
        'Delivery staff is already Denied': 'This application has already been denied',
        'Application not found': 'Application not found',
        'Unauthorized: Only Admins and Agency can approve/deny delivery staff': 'You are not authorized to deny this application',
        'Invalid ApplicationID or status (Approved/Denied) required': 'Invalid application ID or status',
        'Failed to deny delivery staff status': 'Unable to deny application. Please try again later.',
      }[err.message] || (typeof err.message === 'string' ? err.message : 'Failed to deny delivery staff application');

      console.error('submitDeny error:', { message: err.message });
      alert(errorMessage);
    }
  };

  const handleCancelDeny = () => {
    setDenyState({ staffId: null, comments: '' });
  };

  const handleRetry = () => {
    if (user?.AgencyID) {
      dispatch(getPendingDeliveryStaff({ page, limit, AgencyID: user.AgencyID }));
    } else {
      alert('Agency ID not found. Please log in again.');
    }
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pendingDeliveryStaff.totalPages) {
      setPage(newPage);
    }
  };

  // Single Application View
  if (staffId) {
    const application = pendingDeliveryStaff.applications.find((app) => app.ApplicationID === staffId);
    if (loading) {
      return (
        <div className="p-3 max-w-5xl mx-auto">
          <Skeleton height={30} className="mb-3" />
          <Skeleton count={6} height={40} className="mb-2" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center p-3">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base"
          >
            Retry
          </button>
        </div>
      );
    }
    if (!application) {
      return <p className="text-center text-gray-600 p-3 text-sm">Application not found.</p>;
    }

    return (
      <div className="p-3 max-w-7xl mx-auto h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Delivery Staff Application Details</h2>
          <button
            onClick={() => navigate('/agency/application/deliverystaff')}
            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-base"
          >
            Back to List
          </button>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">{application.StaffName || 'N/A'}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 overflow-hidden">
            <div className="flex flex-col overflow-auto">
              <h4 className="text-base font-semibold text-gray-700 mb-1">Personal Information</h4>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {[
                    { label: 'Agency ID', value: application.AgencyID },
                    { label: 'Application ID', value: application.ApplicationID },
                    { label: 'Name', value: application.StaffName },
                    { label: 'Phone', value: application.StaffMobileNo },
                    { label: 'Email', value: application.StaffEmail },
                    { label: 'Aadhar Number', value: application.AadharNumber },
                    { label: 'Date of Birth', value: formatDate(application.DOB) },
                    { label: 'Salary', value: application.Salary ? `₹${application.Salary}` : 'N/A' },
                    { label: 'Assigned Area', value: application.AssignedArea?.join(', ') },
                    { label: 'Application Date', value: formatDate(application.createdAt) },
                    { label: 'Address', value: formatAddress(application.StaffAddress) },
                    { label: 'Status', value: application.Approval_Status },
                  ].map(({ label, value }) => (
                    <tr key={label} className="border-b border-gray-100">
                      <td className="py-1 pr-2 font-medium text-gray-700">{label}</td>
                      <td className="py-1 text-gray-800">{value || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 overflow-hidden">
              <div className="flex-1 overflow-auto">
                <h4 className="text-base font-semibold text-gray-700 mb-1">Documents</h4>
                {application.Documents && Object.keys(application.Documents).length > 0 ? (
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {Object.entries(application.Documents).map(([key, url]) =>
                        url ? (
                          <tr key={key} className="border-b border-gray-100">
                            <td className="py-1 pr-2 font-medium text-gray-700">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </td>
                            <td className="py-1 text-gray-800">
                              <a
                                href={`http://localhost:5001/${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View
                              </a>
                            </td>
                          </tr>
                        ) : null
                      )}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600 text-sm">No documents available.</p>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={() => handleApprove(application.ApplicationID)}
                  disabled={application.Approval_Status !== 'Pending' || loading}
                  className={`px-3 py-1 bg-green-600 text-white rounded-lg transition text-base flex items-center ${
                    application.Approval_Status !== 'Pending' || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                  }`}
                  title={application.Approval_Status !== 'Pending' ? `Application already ${application.Approval_Status}` : 'Approve application'}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </button>
                {denyState.staffId === application.ApplicationID ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={denyState.comments}
                      onChange={(e) => setDenyState({ ...denyState, comments: e.target.value })}
                      className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={2}
                      placeholder="Enter reason for denial"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={submitDeny}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-base flex items-center"
                      >
                        Submit Denial
                      </button>
                      <button
                        onClick={handleCancelDeny}
                        className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-base flex items-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeny(application.ApplicationID)}
                    disabled={application.Approval_Status !== 'Pending' || loading}
                    className={`px-3 py-1 bg-red-600 text-white rounded-lg transition text-base flex items-center ${
                      application.Approval_Status !== 'Pending' || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                    }`}
                    title={application.Approval_Status !== 'Pending' ? `Application already ${application.Approval_Status}` : 'Deny application'}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Deny
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <ErrorBoundaryWithNavigate>
      <div className="p-3 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Pending Delivery Staff Applications</h2>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <label htmlFor="limit" className="text-gray-700 font-medium text-base">
              Entries per page:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={handleLimitChange}
              className="border rounded-lg px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              {[5, 10, 15].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>

        {authLoading || loading ? (
          <div className="p-3 max-w-7xl mx-auto">
            <Skeleton height={30} className="mb-3" />
            <Skeleton count={5} height={40} className="mb-2" />
          </div>
        ) : error ? (
          <div className="text-center p-3">
            <p className="text-red-600 mb-3 text-base">{error}</p>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base"
            >
              Retry
            </button>
          </div>
        ) : pendingDeliveryStaff.applications.length > 0 ? (
          <>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Summary</h3>
              <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {['Name', 'Phone', 'Status', 'Actions'].map((header) => (
                        <th
                          key={header}
                          className="p-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDeliveryStaff.applications.map((app) => (
                      <tr key={app.ApplicationID} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-800 text-sm">{app.StaffName || 'N/A'}</td>
                        <td className="p-3 text-gray-800 text-sm">{app.StaffMobileNo || 'N/A'}</td>
                        <td className="p-3 text-gray-800 text-sm">{app.Approval_Status || 'N/A'}</td>
                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => handleApprove(app.ApplicationID)}
                            disabled={app.Approval_Status !== 'Pending' || loading}
                            className={`px-3 py-1 bg-green-600 text-white rounded-lg transition text-base flex items-center ${
                              app.Approval_Status !== 'Pending' || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                            }`}
                            title={app.Approval_Status !== 'Pending' ? `Application already ${app.Approval_Status}` : 'Approve application'}
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          {denyState.staffId === app.ApplicationID ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={denyState.comments}
                                onChange={(e) => setDenyState({ ...denyState, comments: e.target.value })}
                                className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows={2}
                                placeholder="Enter reason for denial"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={submitDeny}
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-base flex items-center"
                                >
                                  Submit Denial
                                </button>
                                <button
                                  onClick={handleCancelDeny}
                                  className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-base flex items-center"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeny(app.ApplicationID)}
                              disabled={app.Approval_Status !== 'Pending' || loading}
                              className={`px-3 py-1 bg-red-600 text-white rounded-lg transition text-base flex items-center ${
                                app.Approval_Status !== 'Pending' || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                              }`}
                              title={app.Approval_Status !== 'Pending' ? `Application already ${app.Approval_Status}` : 'Deny application'}
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Deny
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/agency/application/deliverystaff/${app.ApplicationID}`)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center text-base"
                            title="View application details"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-gray-600 text-sm">
                Showing {pendingDeliveryStaff.count} of {pendingDeliveryStaff.totalCount} applications
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition text-base"
                >
                  Previous
                </button>
                {Array.from({ length: pendingDeliveryStaff.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded-lg ${
                      pageNum === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                    } transition text-base`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pendingDeliveryStaff.totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition text-base"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600 p-3 text-sm">No pending delivery staff applications.</p>
        )}
      </div>
    </ErrorBoundaryWithNavigate>
  );
};

export default PendingDeliveryStaffApplications;