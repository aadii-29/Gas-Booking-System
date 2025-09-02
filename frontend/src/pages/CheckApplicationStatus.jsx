import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { clearApplicationStatus } from "../ReduxStore/slices/userSlice";
import DeliveryStaffApplicationDetails from "./DeliveryStaffApplicationDetails";

const CheckApplicationStatus = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicationStatus, loading, error } = useSelector((state) => state.user);

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
  };

  const handleCheckAnother = () => {
    dispatch(clearApplicationStatus());
    navigate('/check-application-status');
  };

  const renderApplicationDetails = (apps) => {
    const applications = Array.isArray(apps) ? apps : [apps];
    const isDeliveryStaff = applications.some(app => app && app.ApplicationID && app.StaffName);
    const isCustomer = applications.some(app => app && app.type === 'customer');
    const isAgency = applications.some(app => app && app.AgencyName && !app.type && !app.ApplicationID);

    return (
      <div className="mb-4 bg-white shadow-md rounded-lg p-4 border border-gray-200">
        <h4 className="text-lg font-semibold mb-2">
          {isDeliveryStaff ? "Delivery Staff Applications" : isCustomer ? "Customer Application" : "Agency Application"}
        </h4>
        <div className="overflow-x-auto">
          {isDeliveryStaff && (
            <DeliveryStaffApplicationDetails 
              applications={applications.filter(app => app && app.ApplicationID && app.StaffName)} 
              formatDate={formatDate} 
              showCheckAnotherButton={false} 
            />
          )}
          {applications.map((app, index) => (
            <div key={app?.ApplicationID || app?._id || index} className="mb-6">
              {isCustomer && app?.type === 'customer' && (
                <>
                  <h5 className="text-md font-medium mb-2">Customer Application</h5>
                  <table className="min-w-full text-gray-700 text-sm mb-4">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Customer Name</td>
                        <td className="py-1 px-2">{app.CustomerName || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Email</td>
                        <td className="py-1 px-2">{app.CustomerEmail || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Phone</td>
                        <td className="py-1 px-2">{app.CustomerMobileNo || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Address</td>
                        <td className="py-1 px-2">
                          {app.CustomerAddress
                            ? `${app.CustomerAddress.FlatNo ? `Flat No ${app.CustomerAddress.FlatNo}, ` : ""}${
                                app.CustomerAddress.Building_Society_Name
                                  ? `${app.CustomerAddress.Building_Society_Name}, `
                                  : ""
                              }${app.CustomerAddress.Area}, ${app.CustomerAddress.City}, ${
                                app.CustomerAddress.State
                              }, ${app.CustomerAddress.Pincode}`
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Connection Mode</td>
                        <td className="py-1 px-2">{app.Connection_Mode || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Aadhar Number</td>
                        <td className="py-1 px-2">{app.AadharNumber || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Address Proof</td>
                        <td className="py-1 px-2">{app.AddressProof || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Bank Details</td>
                        <td className="py-1 px-2">
                          {app.Bank
                            ? `Bank: ${app.Bank.BankName}, Account: ${app.Bank.AccountNumber}, IFSC: ${
                                app.Bank.IFSC
                              }${app.Bank.Branch ? `, Branch: ${app.Bank.Branch}` : ""}`
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Allotted Cylinders</td>
                        <td className="py-1 px-2">{app.Alloted_Cylinder || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Agency ID</td>
                        <td className="py-1 px-2">{app.AgencyID || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
              {isAgency && app?.AgencyName && !app?.type && !app?.ApplicationID && (
                <>
                  <h5 className="text-md font-medium mb-2">Agency Application</h5>
                  <table className="min-w-full text-gray-700 text-sm mb-4">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Agency Name</td>
                        <td className="py-1 px-2">{app.AgencyName || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Email</td>
                        <td className="py-1 px-2">{app.AgencyEmail || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Phone</td>
                        <td className="py-1 px-2">{app.AgencyMobileNo || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">GST Number</td>
                        <td className="py-1 px-2">{app.Gst_NO || "N/A"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Address</td>
                        <td className="py-1 px-2">
                          {app.AgencyAddress
                            ? `${app.AgencyAddress.Area}, ${app.AgencyAddress.City}, ${
                                app.AgencyAddress.State
                              }, ${app.AgencyAddress.Pincode}`
                            : "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
              {!isDeliveryStaff && app && (
                <table className="min-w-full text-gray-700 text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Status</td>
                      <td className="py-1 px-2">{app.Approval_Status || app.status || "Pending"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Applied Date</td>
                      <td className="py-1 px-2">
                        {app.Applied_Date ? new Date(app.Applied_Date).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                    {app.Approval_Date && (
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Approval Date</td>
                        <td className="py-1 px-2">{new Date(app.Approval_Date).toLocaleDateString()}</td>
                      </tr>
                    )}
                    {app.Approved_By && (
                      <tr className="border-b">
                        <td className="py-1 px-2 font-semibold w-1/3">Approved By</td>
                        <td className="py-1 px-2">
                          {app.Approved_By.username} ({app.Approved_By.role})
                        </td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">
                        {isCustomer ? "Application ID" : isDeliveryStaff ? "Application ID" : "Agency ID"}
                      </td>
                      <td className="py-1 px-2">
                        {isCustomer ? app._id || "N/A" : isDeliveryStaff ? app.ApplicationID || "N/A" : app.AgencyID || "N/A"}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 px-2 font-semibold w-1/3">Applicant Role</td>
                      <td className="py-1 px-2">{app.UserID?.Role || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
        {/* Add "Check Another Application Status" button after rendering applications */}
        <div className="flex justify-end gap-x-4 mt-4">
          <button
            onClick={handleCheckAnother}
            className="w-full max-w-xs px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Check Another Application Status
          </button>
        </div>
      </div>
    );
  };

  const handleViewDeliveryStaffApplications = () => {
    navigate('/view-deliverystaff-application');
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-4">
          <FaSearch className="w-6 h-6 mr-2 text-blue-500" />
          <h1 className="text-2xl font-bold">Check Application Status</h1>
        </div>

        {/* Display application result if available */}
        {applicationStatus && renderApplicationDetails(applicationStatus)}

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

        {/* Navigation Buttons - Only in Initial State */}
        {!applicationStatus && !loading && !error && (
          <div className="flex flex-wrap space-x-2 mt-4">
            <button
              type="button"
              onClick={() => navigate('/view-customer-application')}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              View Customer Application
            </button>
            <button
              type="button"
              onClick={() => navigate('/view-application')}
              className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Recent Application
            </button>
            <button
              type="button"
              onClick={handleViewDeliveryStaffApplications}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              View Delivery Staff Applications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckApplicationStatus;