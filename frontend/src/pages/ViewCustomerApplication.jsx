import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserApplications, clearApplicationStatus } from '../ReduxStore/slices/userSlice';

const ViewCustomerApplication = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicationStatus, loading, error } = useSelector((state) => state.user);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter customer applications
  const customerApplications = Array.isArray(applicationStatus)
    ? applicationStatus.filter((app) => app.type === 'customer')
    : [];

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
    if (customerApplications && currentIndex < customerApplications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Your Customer Application History</h1>

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

        {/* Display current customer application in table format */}
        {customerApplications.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold">
                Customer Application {currentIndex + 1} of {customerApplications.length}
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
                  disabled={currentIndex === customerApplications.length - 1}
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
                      <td className="py-1 px-2 font-semibold w-1/3">Customer Name</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].CustomerName || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Email</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].CustomerEmail || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Phone</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].CustomerMobileNo || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Address</td>
                      <td className="py-1 px-2">
                        {customerApplications[currentIndex].CustomerAddress
                          ? `${customerApplications[currentIndex].CustomerAddress.FlatNo ? `Flat No ${customerApplications[currentIndex].CustomerAddress.FlatNo}, ` : ''}${customerApplications[currentIndex].CustomerAddress.Building_Society_Name ? `${customerApplications[currentIndex].CustomerAddress.Building_Society_Name}, ` : ''}${customerApplications[currentIndex].CustomerAddress.Area}, ${customerApplications[currentIndex].CustomerAddress.City}, ${customerApplications[currentIndex].CustomerAddress.State}, ${customerApplications[currentIndex].CustomerAddress.Pincode}`
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Connection Mode</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].Connection_Mode || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Aadhar Number</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].AadharNumber || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Address Proof</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].AddressProof || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Bank Details</td>
                      <td className="py-1 px-2">
                        {customerApplications[currentIndex].Bank
                          ? `Bank: ${customerApplications[currentIndex].Bank.BankName}, Account: ${customerApplications[currentIndex].Bank.AccountNumber}, IFSC: ${customerApplications[currentIndex].Bank.IFSC}${customerApplications[currentIndex].Bank.Branch ? `, Branch: ${customerApplications[currentIndex].Bank.Branch}` : ''}`
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Allotted Cylinders</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].Alloted_Cylinder || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Agency ID</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].AgencyID || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Status</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].Approval_Status || 'Pending'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Applied Date</td>
                      <td className="py-1 px-2">
                        {customerApplications[currentIndex].Applied_Date
                          ? new Date(customerApplications[currentIndex].Applied_Date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                    {customerApplications[currentIndex].Approval_Date && (
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Approval Date</td>
                        <td className="py-1 px-2">
                          {new Date(customerApplications[currentIndex].Approval_Date).toLocaleDateString()}
                        </td>
                      </tr>
                    )}
                    {customerApplications[currentIndex].Approved_By && (
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Approved By</td>
                        <td className="py-1 px-2">
                          {customerApplications[currentIndex].Approved_By.username} (
                          {customerApplications[currentIndex].Approved_By.role})
                        </td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Registration ID</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].RegistrationID || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Customer ID</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].CustomerID || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Applicant Role</td>
                      <td className="py-1 px-2">{customerApplications[currentIndex].UserID?.Role || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <p className="text-gray-600 text-center">No customer applications found for this user.</p>
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

export default ViewCustomerApplication;