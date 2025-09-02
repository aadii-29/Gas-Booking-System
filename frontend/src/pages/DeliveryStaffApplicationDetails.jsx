import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { checkApplicationStatus, clearApplicationStatus } from "../ReduxStore/slices/userSlice";

const ViewDeliveryStaffApplication = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicationStatus, loading, error } = useSelector((state) => state.user);
  const [applicationID, setApplicationID] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(checkApplicationStatus(applicationID)).unwrap();
      setCurrentIndex(0); // Reset to the first application on new search
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckAnother = () => {
    dispatch(clearApplicationStatus());
    setApplicationID("");
    setCurrentIndex(0);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    const applications = Array.isArray(applicationStatus) ? applicationStatus : [applicationStatus];
    if (currentIndex < applications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  const renderApplicationDetails = (app) => (
    <div className="mb-4 bg-white shadow-md rounded-lg p-4 border border-gray-200">
      <h4 className="text-lg font-semibold mb-4">Delivery Staff Application Details</h4>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Section: Basic Personal Details */}
        <div className="w-full md:w-1/2">
          <table className="min-w-full text-gray-700 text-sm border border-gray-300">
            <tbody>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Application ID</td>
                <td className="py-1 px-2 break-words">{app.ApplicationID || "N/A"}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Agency ID</td>
                <td className="py-1 px-2 break-words">{app.AgencyID || "N/A"}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Staff Name</td>
                <td className="py-1 px-2 break-words">{app.StaffName || "N/A"}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Date of Birth</td>
                <td className="py-1 px-2 break-words">{formatDate(app.DOB)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Mobile Number</td>
                <td className="py-1 px-2 break-words">{app.StaffMobileNo || "N/A"}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Email</td>
                <td className="py-1 px-2 break-words">{app.StaffEmail || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Section: Additional Details */}
        <div className="w-full md:w-1/2">
          <table className="min-w-full text-gray-700 text-sm border border-gray-300">
            <tbody>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Address</td>
                <td className="py-1 px-2 break-words">
                  {app.StaffAddress && typeof app.StaffAddress === 'object'
                    ? `${app.StaffAddress.FlatNo || ''}, ${app.StaffAddress.Building_Society_Name || ''}, ${app.StaffAddress.Area || ''}, ${app.StaffAddress.City || ''}, ${app.StaffAddress.State || ''}, ${app.StaffAddress.Pincode || ''}`
                    : "N/A"}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Aadhar Number</td>
                <td className="py-1 px-2 break-words">{app.AadharNumber || "N/A"}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Salary</td>
                <td className="py-1 px-2 break-words">{app.Salary || "N/A"}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Assigned Area</td>
                <td className="py-1 px-2 break-words">
                  {Array.isArray(app.AssignedArea) && app.AssignedArea.length > 0 ? app.AssignedArea.join(", ") : "N/A"}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Approval Status</td>
                <td className="py-1 px-2 break-words">{app.Approval_Status || "Pending"}</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Status</td>
                <td className="py-1 px-2 break-words">{app.Status || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents Section (Full Width) */}
      {app.Documents && typeof app.Documents === 'object' && (
        <div className="mt-4">
          <h5 className="text-md font-semibold mb-2">Uploaded Documents</h5>
          <table className="min-w-full text-gray-700 text-sm border border-gray-300">
            <tbody>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Aadhar Document</td>
                <td className="py-1 px-2 break-words">
                  {app.Documents.AadharDocument
                    ? app.Documents.AadharDocument.split("/").pop()
                    : "Not provided"}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Staff Photo</td>
                <td className="py-1 px-2 break-words">
                  {app.Documents.StaffPhoto
                    ? app.Documents.StaffPhoto.split("/").pop()
                    : "Not provided"}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-1 px-2 font-semibold w-1/3 border-r border-gray-300">Staff Signature</td>
                <td className="py-1 px-2 break-words">
                  {app.Documents.StaffSignature
                    ? app.Documents.StaffSignature.split("/").pop()
                    : "Not provided"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Ensure applicationStatus is treated as an array
  const applications = Array.isArray(applicationStatus) ? applicationStatus : applicationStatus ? [applicationStatus] : [];
  const hasMultipleApplications = applications.length > 1;

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-4">
          <FaSearch className="w-6 h-6 mr-2 text-blue-500" />
          <h1 className="text-2xl font-bold">View Delivery Staff Application Status</h1>
        </div>

        {/* Form to Enter Application ID */}
        {!applicationStatus && (
          <form onSubmit={handleSubmit} className="space-y-6 mb-4">
            <div>
              <label
                htmlFor="ApplicationID"
                className="block text-sm font-medium text-gray-900"
              >
                Application ID
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="ApplicationID"
                  value={applicationID}
                  onChange={(e) => setApplicationID(e.target.value)}
                  placeholder="Enter Application ID (e.g., APP2505060000000003)"
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-x-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm font-semibold text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !applicationID.trim()}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Status
              </button>
            </div>
          </form>
        )}

        {/* Display Application Details (One at a Time) */}
        {applications.length > 0 && renderApplicationDetails(applications[currentIndex])}

        {/* Navigation Buttons for Multiple Applications */}
        {applications.length > 0 && hasMultipleApplications && (
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === applications.length - 1}
              className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Check Another Button */}
        {applications.length > 0 && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleCheckAnother}
              className="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              Check Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDeliveryStaffApplication;