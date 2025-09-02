import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkApplicationStatus } from '../../ReduxStore/slices/userSlice';
import { toast } from 'react-toastify';

const ApplicationStatus = () => {
  const dispatch = useDispatch();
  const { applicationStatus, loading, error } = useSelector((state) => state.user);
  const [registrationID, setRegistrationID] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(checkApplicationStatus(registrationID)).unwrap();
      toast.success('Application status fetched successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to fetch application status');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">
      <h3 className="text-2xl font-bold mb-6">Check Application Status</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="registrationID"
            className="block text-sm font-medium text-gray-700"
          >
            Registration ID
          </label>
          <input
            type="text"
            id="registrationID"
            placeholder="Enter your registration ID"
            value={registrationID}
            onChange={(e) => setRegistrationID(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </form>

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {applicationStatus && (
        <div className="mt-4 bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Application Status</h4>
          <div className="text-gray-700 space-y-2">
            <p>
              <strong>Agency Name:</strong> {applicationStatus.AgencyName || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong> {applicationStatus.AgencyEmail || 'N/A'}
            </p>
            <p>
              <strong>Phone:</strong> {applicationStatus.AgencyMobileNo || 'N/A'}
            </p>
            <p>
              <strong>GST Number:</strong> {applicationStatus.Gst_NO || 'N/A'}
            </p>
            <p>
              <strong>Address:</strong>{' '}
              {applicationStatus.AgencyAddress
                ? `${applicationStatus.AgencyAddress.Area}, ${applicationStatus.AgencyAddress.City}, ${applicationStatus.AgencyAddress.State}, ${applicationStatus.AgencyAddress.Pincode}`
                : 'N/A'}
            </p>
            <p>
              <strong>Status:</strong> {applicationStatus.Approval_Status || 'N/A'}
            </p>
            <p>
              <strong>Applied Date:</strong>{' '}
              {applicationStatus.Applied_Date
                ? new Date(applicationStatus.Applied_Date).toLocaleDateString()
                : 'N/A'}
            </p>
            {applicationStatus.Approval_Date && (
              <p>
                <strong>Approval Date:</strong>{' '}
                {new Date(applicationStatus.Approval_Date).toLocaleDateString()}
              </p>
            )}
            {applicationStatus.Approved_By && (
              <p>
                <strong>Approved By:</strong> {applicationStatus.Approved_By.username} (
                {applicationStatus.Approved_By.role})
              </p>
            )}
            <p>
              <strong>Registration ID:</strong> {applicationStatus.RegistrationID || 'N/A'}
            </p>
            <p>
              <strong>Agency ID:</strong> {applicationStatus.AgencyID || 'N/A'}
            </p>
            <p>
              <strong>Applicant Role:</strong> {applicationStatus.Applicant_Role || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;