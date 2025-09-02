/* eslint-disable no-unused-vars */
import React, { useEffect, useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getPendingNewCustomer, updateCustomerStatus } from '../../ReduxStore/slices/agencySlice';
import { Dialog, Transition } from '@headlessui/react';
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
                onClick={() => this.props.navigate('/agency/application/customer')}
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

// Generic Modal Component
const Modal = ({ isOpen, onClose, title, children, buttons, icon }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={() => {}}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-30" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-3">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-xl p-3">
              <div className="flex items-center gap-2 mb-3">
                {icon}
                <Dialog.Title className="text-xl font-semibold text-gray-800">{title}</Dialog.Title>
              </div>
              <div className="text-sm text-gray-600 mb-3">{children}</div>
              <div className="flex justify-end gap-2">
                {buttons.map(({ label, onClick, className }, index) => (
                  <button
                    key={index}
                    onClick={onClick}
                    className={`px-3 py-1 rounded-lg text-base ${className}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

const PendingCustomerApplications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registrationId } = useParams();
  const { pendingCustomers, loading, error } = useSelector((state) => state.agency);
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [modal, setModal] = useState({ type: null, data: null });
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.AgencyID || user?.role?.toLowerCase() !== 'agency') {
      navigate('/unauthorized');
      return;
    }
    dispatch(getPendingNewCustomer({ page, limit, AgencyID: user.AgencyID }));
  }, [dispatch, user, authLoading, page, limit, navigate]);

  const handleApprove = async (applicationId) => {
    try {
      if (!user?.AgencyID || user?.role?.toLowerCase() !== 'agency') {
        throw new Error('Unauthorized: Agency account required');
      }

      const application = pendingCustomers.customers.find((app) => app.id === applicationId);
      if (!application) {
        throw new Error('Application not found');
      }
      if (application.status !== 'Pending') {
        throw new Error(`Application is already ${application.status}`);
      }

      const action = await dispatch(
        updateCustomerStatus({
          registrationId: applicationId,
          status: 'Approved',
          comments: 'Approved by agency',
        })
      );

      if (action.meta.requestStatus === 'fulfilled') {
        console.log('Approval payload:', action.payload);
        await dispatch(getPendingNewCustomer({ page, limit, AgencyID: user.AgencyID })).unwrap();
        navigate(`/agency/application/customer/response/${applicationId}`, { state: { response: action.payload.data } });
      } else {
        throw new Error(action.payload?.message || 'Failed to update customer status');
      }
    } catch (err) {
      const errorMessage = {
        'Customer is already Approved': 'This application has already been approved',
        'Customer is already Denied': 'This application has already been denied',
        'Customer not found': 'Application not found',
        'Unauthorized: Only Admins and Agency can approve/deny customers': 'You are not authorized to approve this application',
        'Invalid RegistrationID or status (Approved/Denied) required': 'Invalid application ID or status',
      }[err.message] || (typeof err.message === 'string' ? err.message : 'Failed to approve customer application');

      console.error('handleApprove error:', { message: err.message, applicationId });
      setModal({ type: 'error', data: { message: errorMessage } });
    }
  };

  const handleDeny = (applicationId) => {
    setModal({ type: 'deny', data: { applicationId } });
  };

  const submitDeny = async (comments) => {
    if (!comments.trim()) {
      setModal({ type: 'error', data: { message: 'Please provide a reason for denial' } });
      return;
    }
    try {
      const action = await dispatch(
        updateCustomerStatus({
          registrationId: modal.data.applicationId,
          status: 'Denied',
          comments,
        })
      );

      if (action.meta.requestStatus === 'fulfilled') {
        await dispatch(getPendingNewCustomer({ page, limit, AgencyID: user.AgencyID })).unwrap();
        setModal({ type: null, data: null });
        navigate('/agency/application/customer');
      } else {
        throw new Error(action.payload?.message || 'Failed to deny customer status');
      }
    } catch (err) {
      const errorMessage = {
        'Customer is already Denied': 'This application has already been denied',
        'Customer not found': 'Application not found',
        'Unauthorized: Only Admins and Agency can approve/deny customers': 'You are not authorized to deny this application',
        'Invalid RegistrationID or status (Approved/Denied) required': 'Invalid application ID or status',
        'Failed to deny customer status': 'Unable to deny application. Please try again later.',
      }[err.message] || (typeof err.message === 'string' ? err.message : 'Failed to deny customer application');

      console.error('submitDeny error:', { message: err.message });
      setModal({ type: 'error', data: { message: errorMessage } });
    }
  };

  const handleRetry = () => {
    if (user?.AgencyID) {
      dispatch(getPendingNewCustomer({ page, limit, AgencyID: user.AgencyID }));
    } else {
      setModal({ type: 'error', data: { message: 'Agency ID not found. Please log in again.' } });
    }
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setPage(1);
    setExpandedRow(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pendingCustomers.totalPages) {
      setPage(newPage);
      setExpandedRow(null);
    }
  };

  const openCostBreakdown = (app) => {
    setModal({ type: 'cost', data: app });
  };

  const toggleRow = (appId) => {
    setExpandedRow(expandedRow === appId ? null : appId);
  };

  // Single Application View
  if (registrationId) {
    const application = pendingCustomers.customers.find((app) => app.id === registrationId);
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
      <div
        className="p-3 max-w-7xl mx-auto h-[calc(100vh-3rem)] flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Customer Application Details</h2>
          <button
            onClick={() => navigate('/agency/application/customer')}
            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-base"
          >
            Back to List
          </button>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">{application.name || 'N/A'}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 overflow-hidden">
            <div className="flex flex-col overflow-auto">
              <h4 className="text-base font-semibold text-gray-700 mb-1">Personal Information</h4>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {[
                    { label: 'Agency ID', value: application.agencyId },
                    { label: 'Registration ID', value: application.id },
                    { label: 'Name', value: application.name },
                    { label: 'Phone', value: application.phone },
                    { label: 'Email', value: application.email },
                    { label: 'Aadhar Number', value: application.aadharNumber },
                    { label: 'Application Date', value: formatDate(application.appliedDate) },
                    { label: 'Address', value: application.address },
                    { label: 'Address Proof', value: application.addressProof },
                    { label: 'Connection Mode', value: application.connectionMode },
                    { label: 'Allotted Cylinder', value: application.allotedCylinder },
                    { label: 'Pending Payment', value: application.pendingPayment ? `₹${application.pendingPayment.toFixed(2)}` : 'N/A' },
                    { label: 'Status', value: application.status },
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
                <h4 className="text-base font-semibold text-gray-700 mb-1">Bank Details</h4>
                {application.bank && typeof application.bank === 'object' ? (
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {[
                        { label: 'Bank Name', value: application.bank.BankName },
                        { label: 'Account Number', value: application.bank.AccountNumber },
                        { label: 'IFSC Code', value: application.bank.IFSC },
                        { label: 'Branch', value: application.bank.Branch },
                      ].map(({ label, value }) => (
                        <tr key={label} className="border-b border-gray-100">
                          <td className="py-1 pr-2 font-medium text-gray-700">{label}</td>
                          <td className="py-1 text-gray-800">{value || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600 text-sm">No bank details available.</p>
                )}
              </div>
              <div className="flex-1 overflow-auto">
                <h4 className="text-base font-semibold text-gray-700 mb-1">Documents</h4>
                {application.documents && Object.keys(application.documents).length > 0 ? (
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {Object.entries(application.documents).map(([key, url]) =>
                        url ? (
                          <tr key={key} className="border-b border-gray-100">
                            <td className="py-1 pr-2 font-medium text-gray-700">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </td>
                            <td className="py-1 text-gray-800">
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
                  onClick={() => openCostBreakdown(application)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base"
                >
                  Cost Breakdown
                </button>
                <button
                  onClick={() => handleApprove(application.id)}
                  disabled={application.status !== 'Pending' || loading}
                  className={`px-3 py-1 bg-green-600 text-white rounded-lg transition text-base flex items-center ${
                    application.status !== 'Pending' || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                  }`}
                  title={application.status !== 'Pending' ? `Application already ${application.status}` : 'Approve application'}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </button>
                <button
                  onClick={() => handleDeny(application.id)}
                  disabled={application.status !== 'Pending' || loading}
                  className={`px-3 py-1 bg-red-600 text-white rounded-lg transition text-base flex items-center ${
                    application.status !== 'Pending' || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                  title={application.status !== 'Pending' ? `Application already ${application.status}` : 'Deny application'}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Deny
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {modal.type === 'cost' && (
          <Modal
            isOpen={!!modal.type}
            onClose={() => setModal({ type: null, data: null })}
            title="Cost Breakdown"
            icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
            buttons={[{
              label: 'Close',
              onClick: () => setModal({ type: null, data: null }),
              className: 'bg-gray-600 text-white hover:bg-gray-700',
            }]}
          >
            {modal.data?.costBreakdown && (
              <ul className="space-y-1">
                {Object.entries(modal.data.costBreakdown).map(([key, value]) => (
                  <li key={key} className="flex justify-between text-gray-600 border-b py-1 text-base">
                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</span>
                    <span className="font-medium">₹{value || 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </Modal>
        )}

        {modal.type === 'deny' && (
          <Modal
            isOpen={!!modal.type}
            onClose={() => setModal({ type: null, data: null })}
            title="Deny Application"
            icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
            buttons={[{
              label: 'Cancel',
              onClick: () => setModal({ type: null, data: null }),
              className: 'bg-gray-600 text-white hover:bg-gray-700',
            }, {
              label: 'Deny',
              onClick: () => {
                const comments = document.getElementById('denyComments')?.value || '';
                submitDeny(comments);
              },
              className: 'bg-red-600 text-white hover:bg-red-700',
            }]}
          >
            <label htmlFor="denyComments" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Denial
            </label>
            <textarea
              id="denyComments"
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="Enter reason for denial"
            />
          </Modal>
        )}

        {modal.type === 'error' && (
          <Modal
            isOpen={!!modal.type}
            onClose={() => setModal({ type: null, data: null })}
            title="Error"
            icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            buttons={[{
              label: 'Close',
              onClick: () => setModal({ type: null, data: null }),
              className: 'bg-gray-600 text-white hover:bg-gray-700',
            }]}
          >
            {modal.data?.message || 'An unexpected error occurred.'}
          </Modal>
        )}
      </div>
    );
  }

  // List View
  return (
    <ErrorBoundaryWithNavigate>
      <div
        className="p-3 max-w-7xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Pending Customer Applications</h2>
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
        ) : pendingCustomers.customers.length > 0 ? (
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
                    {pendingCustomers.customers.map((app) => (
                      <Fragment key={app.id}>
                        <tr
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3 text-gray-800 text-sm">{app.name || 'N/A'}</td>
                          <td className="p-3 text-gray-800 text-sm">{app.phone || 'N/A'}</td>
                          <td className="p-3 text-gray-800 text-sm">{app.status || 'N/A'}</td>
                          <td className="p-3 flex gap-2">
                            <button
                              onClick={() => handleApprove(app.id)}
                              disabled={app.status !== 'Pending' || loading}
                              className={`px-3 py-1 bg-green-600 text-white rounded-lg transition text-base flex items-center ${
                                app.status !== 'Pending' || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                              }`}
                              title={app.status !== 'Pending' ? `Application already ${app.status}` : 'Approve application'}
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeny(app.id)}
                              disabled={app.status !== 'Pending' || loading}
                              className={`px-3 py-1 bg-red-600 text-white rounded-lg transition text-base flex items-center ${
                                app.status !== 'Pending' || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                              }`}
                              title={app.status !== 'Pending' ? `Application already ${app.status}` : 'Deny application'}
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Deny
                            </button>
                            <button
                              onClick={() => toggleRow(app.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center text-base"
                              title="Toggle detailed view"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 9c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z"
                                />
                              </svg>
                              {expandedRow === app.id ? 'Hide' : 'Details'}
                            </button>
                          </td>
                        </tr>
                        {expandedRow === app.id && (
                          <tr
                            className="bg-gray-100"
                          >
                            <td colSpan="4" className="p-3">
                              <div className="bg-white rounded-lg p-3">
                                <h4 className="font-semibold text-gray-700 mb-2 text-base">Additional Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <p className="text-sm"><strong>Address:</strong> {app.address || 'N/A'}</p>
                                  <p className="text-sm"><strong>Email:</strong> {app.email || 'N/A'}</p>
                                  <p className="text-sm"><strong>Connection Mode:</strong> {app.connectionMode || 'N/A'}</p>
                                  <p className="text-sm"><strong>Pending Payment:</strong> {app.pendingPayment ? `₹${app.pendingPayment.toFixed(2)}` : 'N/A'}</p>
                                </div>
                                {app.costBreakdown && (
                                  <div className="mt-3">
                                    <button
                                      onClick={() => openCostBreakdown(app)}
                                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base"
                                      title="View cost breakdown"
                                    >
                                      View Cost Breakdown
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-gray-600 text-sm">
                Showing {pendingCustomers.count} of {pendingCustomers.totalCount} applications
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition text-base"
                >
                  Previous
                </button>
                {Array.from({ length: pendingCustomers.totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                  disabled={page === pendingCustomers.totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition text-base"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600 p-3 text-sm">No pending customer applications.</p>
        )}

        {/* Modals */}
        {modal.type === 'cost' && (
          <Modal
            isOpen={!!modal.type}
            onClose={() => setModal({ type: null, data: null })}
            title="Cost Breakdown"
            icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
            buttons={[{
              label: 'Close',
              onClick: () => setModal({ type: null, data: null }),
              className: 'bg-gray-600 text-white hover:bg-gray-700',
            }]}
          >
            {modal.data?.costBreakdown && (
              <ul className="space-y-1">
                {Object.entries(modal.data.costBreakdown).map(([key, value]) => (
                  <li key={key} className="flex justify-between text-gray-600 border-b py-1 text-base">
                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</span>
                    <span className="font-medium">₹{value || 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </Modal>
        )}

        {modal.type === 'deny' && (
          <Modal
            isOpen={!!modal.type}
            onClose={() => setModal({ type: null, data: null })}
            title="Deny Application"
            icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
            buttons={[{
              label: 'Cancel',
              onClick: () => setModal({ type: null, data: null }),
              className: 'bg-gray-600 text-white hover:bg-gray-700',
            }, {
              label: 'Deny',
              onClick: () => {
                const comments = document.getElementById('denyComments')?.value || '';
                submitDeny(comments);
              },
              className: 'bg-red-600 text-white hover:bg-red-700',
            }]}
          >
            <label htmlFor="denyComments" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Denial
            </label>
            <textarea
              id="denyComments"
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="Enter reason for denial"
            />
          </Modal>
        )}

        {modal.type === 'error' && (
          <Modal
            isOpen={!!modal.type}
            onClose={() => setModal({ type: null, data: null })}
            title="Error"
            icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            buttons={[{
              label: 'Close',
              onClick: () => setModal({ type: null, data: null }),
              className: 'bg-gray-600 text-white hover:bg-gray-700',
            }]}
          >
            {modal.data?.message || 'An unexpected error occurred.'}
          </Modal>
        )}
      </div>
    </ErrorBoundaryWithNavigate>
  );
};

export default PendingCustomerApplications;