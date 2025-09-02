import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserApplications, clearApplicationStatus } from '../ReduxStore/slices/userSlice';

const ViewApplication = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicationStatus, loading, error } = useSelector((state) => state.user);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch all applications when the component mounts
  useEffect(() => {
    dispatch(fetchUserApplications());

    // Cleanup on unmount
    return () => {
      dispatch(clearApplicationStatus());
    };
  }, [dispatch]);

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (applicationStatus && currentIndex < applicationStatus.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Your Application History</h1>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center mb-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Display current application in table format */}
        {applicationStatus && Array.isArray(applicationStatus) && applicationStatus.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold">
                {applicationStatus[currentIndex].type.charAt(0).toUpperCase() +
                  applicationStatus[currentIndex].type.slice(1)}{' '}
                Application {currentIndex + 1} of {applicationStatus.length}
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === applicationStatus.length - 1}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-gray-700 text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">
                        {applicationStatus[currentIndex].type === 'agency' ? 'Agency Name' : 'Name'}
                      </td>
                      <td className="py-1 px-2">
                        {applicationStatus[currentIndex].type === 'agency'
                          ? applicationStatus[currentIndex].AgencyName
                          : applicationStatus[currentIndex].Name || 'N/A'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Email</td>
                      <td className="py-1 px-2">
                        {applicationStatus[currentIndex].AgencyEmail ||
                        applicationStatus[currentIndex].CustomerEmail ||
                        applicationStatus[currentIndex].Email ||
                        'N/A'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Phone</td>
                      <td className="py-1 px-2">
                        {applicationStatus[currentIndex].AgencyMobileNo ||
                        applicationStatus[currentIndex].Phone ||
                        applicationStatus[currentIndex].MobileNo ||
                        'N/A'}
                      </td>
                    </tr>
                    {applicationStatus[currentIndex].type === 'agency' && (
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">GST Number</td>
                        <td className="py-1 px-2">{applicationStatus[currentIndex].Gst_NO || 'N/A'}</td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Address</td>
                      <td className="py-1 px-2">
                        {applicationStatus[currentIndex].AgencyAddress
                          ? `${applicationStatus[currentIndex].AgencyAddress.Area}, ${applicationStatus[currentIndex].AgencyAddress.City}, ${applicationStatus[currentIndex].AgencyAddress.State}, ${applicationStatus[currentIndex].AgencyAddress.Pincode}`
                          : applicationStatus[currentIndex].Address
                          ? `${applicationStatus[currentIndex].Address.Area || ''}${applicationStatus[currentIndex].Address.Area ? ', ' : ''}${applicationStatus[currentIndex].Address.City || ''}${applicationStatus[currentIndex].Address.City ? ', ' : ''}${applicationStatus[currentIndex].Address.State || ''}${applicationStatus[currentIndex].Address.State ? ', ' : ''}${applicationStatus[currentIndex].Address.Pincode || ''}`
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Status</td>
                      <td className="py-1 px-2">
                        {applicationStatus[currentIndex].Approval_Status ||
                        applicationStatus[currentIndex].status ||
                        'Pending'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Applied Date</td>
                      <td className="py-1 px-2">
                        {applicationStatus[currentIndex].Applied_Date
                          ? new Date(applicationStatus[currentIndex].Applied_Date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                    {applicationStatus[currentIndex].Approval_Date && (
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Approval Date</td>
                        <td className="py-1 px-2">
                          {new Date(applicationStatus[currentIndex].Approval_Date).toLocaleDateString()}
                        </td>
                      </tr>
                    )}
                    {applicationStatus[currentIndex].Approved_By && (
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Approved By</td>
                        <td className="py-1 px-2">
                          {applicationStatus[currentIndex].Approved_By.username} (
                          {applicationStatus[currentIndex].Approved_By.role})
                        </td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Registration ID</td>
                      <td className="py-1 px-2">{applicationStatus[currentIndex].RegistrationID || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">
                        {applicationStatus[currentIndex].type === 'agency' ? 'Agency ID' : 'Application ID'}
                      </td>
                      <td className="py-1 px-2">
                        {applicationStatus[currentIndex].type === 'agency'
                          ? applicationStatus[currentIndex].AgencyID || 'N/A'
                          : applicationStatus[currentIndex]._id || 'N/A'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Applicant Role</td>
                      <td className="py-1 px-2">{applicationStatus[currentIndex].UserID?.Role || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <p className="text-gray-600 text-center">No applications found for this user.</p>
          )
        )}

        {/* Button to navigate to Check Application Status */}
        <button
          onClick={() => navigate('/check-application-status')}
          className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Check Another Application Status
        </button>
      </div>
    </div>
  );
};

export default ViewApplication;