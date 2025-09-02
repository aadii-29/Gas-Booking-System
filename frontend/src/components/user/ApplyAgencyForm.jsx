
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { applyDeliveryStaffSchema } from "../../utils/validations";
import {
  applyForDeliveryStaff,
  fetchAgencies,
} from "../../ReduxStore/slices/userSlice";

const ApplyDeliveryStaffForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { agencies, loading, error } = useSelector((state) => state.user);
  const [files, setFiles] = useState({
    AadharDocument: null,
    StaffPhoto: null,
    StaffSignature: null,
  });
  const [step, setStep] = useState(0);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchAgencies());
  }, [dispatch]);

  const initialValues = {
    AgencyID: "",
    StaffName: "",
    DOB: "",
    StaffMobileNo: "",
    StaffEmail: "",
    StaffAddress: {
      FlatNo: "",
      Building_Society_Name: "",
      Area: "",
      City: "",
      State: "",
      Pincode: "",
    },
    AadharNumber: "",
    Salary: "",
    AssignedArea: "",
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    setFiles((prev) => ({ ...prev, [name]: file }));
    console.log(`File selected for ${name}:`, file ? file.name : "None");
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const missingFiles = [];
      if (!files.AadharDocument) missingFiles.push("Aadhar Document");
      if (!files.StaffPhoto) missingFiles.push("Staff Photo");
      if (!files.StaffSignature) missingFiles.push("Staff Signature");
      if (missingFiles.length > 0) {
        toast.error(
          `Please upload the following required documents: ${missingFiles.join(", ")}`
        );
        setSubmitting(false);
        return;
      }

      console.log(
        "Submitting form with values:",
        JSON.stringify(values, null, 2)
      );
      const formData = new FormData();
      formData.append("AgencyID", values.AgencyID.trim());
      formData.append("StaffName", values.StaffName.trim());
      formData.append("DOB", values.DOB);
      formData.append("StaffMobileNo", values.StaffMobileNo);
      formData.append("StaffEmail", values.StaffEmail.trim());
      // Append StaffAddress fields individually
      formData.append("StaffAddress.FlatNo", values.StaffAddress.FlatNo);
      formData.append("StaffAddress.Building_Society_Name", values.StaffAddress.Building_Society_Name.trim());
      formData.append("StaffAddress.Area", values.StaffAddress.Area.trim());
      formData.append("StaffAddress.City", values.StaffAddress.City.trim());
      formData.append("StaffAddress.State", values.StaffAddress.State.trim());
      formData.append("StaffAddress.Pincode", values.StaffAddress.Pincode);
      formData.append("AadharNumber", values.AadharNumber);
      formData.append("Salary", values.Salary);
      formData.append("AssignedArea", values.AssignedArea.trim());
      formData.append("AadharDocument", files.AadharDocument);
      formData.append("StaffPhoto", files.StaffPhoto);
      formData.append("StaffSignature", files.StaffSignature);

      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? value.name : value}`);
      }

      console.log("Dispatching applyForDeliveryStaff...");
      const response = await dispatch(applyForDeliveryStaff(formData)).unwrap();
      console.log("API Response:", JSON.stringify(response, null, 2));
      setApplicationDetails(response);
      setShowSuccess(true);
      toast.success("Delivery staff application submitted successfully");
      resetForm();
      setFiles({
        AadharDocument: null,
        StaffPhoto: null,
        StaffSignature: null,
      });
      setStep(0);
    } catch (error) {
      const errorMessage = error.message || "Failed to submit application";
      console.error("Submission Error:", {
        message: errorMessage,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error,
      });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = (values) => {
    if (step === 0 && !values.AgencyID) {
      toast.error("Please select an agency to proceed");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
  };

  const handleProceedToStatus = () => {
    setShowSuccess(false);
    navigate("/check-application-status");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {loading && (
          <div className="flex justify-center mb-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <div className="mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {showSuccess && applicationDetails && (
          <div className="mb-4 bg-green-50 border border-green-200 text-gray-900 px-4 py-3 rounded">
            <h3 className="text-lg font-semibold text-green-700">
              Application Submitted Successfully
            </h3>
            <div className="mt-4">
              <p className="text-sm">
                <strong>Application ID:</strong>{" "}
                {applicationDetails.ApplicationID}
              </p>
              <p className="text-sm">
                <strong>Agency ID:</strong> {applicationDetails.AgencyID}
              </p>
              <p className="text-sm">
                <strong>Staff Name:</strong> {applicationDetails.StaffName}
              </p>
              <p className="text-sm">
                <strong>Date of Birth:</strong>{" "}
                {formatDate(applicationDetails.DOB)}
              </p>
              <p className="text-sm">
                <strong>Approval Status:</strong>{" "}
                {applicationDetails.Approval_Status}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-base font-semibold text-gray-900">
                Uploaded Documents
              </h4>
              <ul className="list-disc list-inside text-sm">
                <li>
                  Aadhar Document:{" "}
                  {applicationDetails.Documents.AadharDocument.split("/").pop()}
                </li>
                <li>
                  Staff Photo:{" "}
                  {applicationDetails.Documents.StaffPhoto.split("/").pop()}
                </li>
                <li>
                  Staff Signature:{" "}
                  {applicationDetails.Documents.StaffSignature.split("/").pop()}
                </li>
              </ul>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleProceedToStatus}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Check Application Status
              </button>
            </div>
          </div>
        )}

        {!showSuccess && (
          <Formik
            initialValues={initialValues}
            validationSchema={applyDeliveryStaffSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="space-y-6">
                <div className="flex items-center justify-center mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 0 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}
                  >
                    1
                  </div>
                  <div className="w-10 h-1 bg-gray-200 mx-2"></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}
                  >
                    2
                  </div>
                  <div className="w-10 h-1 bg-gray-200 mx-2"></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}
                  >
                    3
                  </div>
                  <div className="w-10 h-1 bg-gray-200 mx-2"></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}
                  >
                    4
                  </div>
                </div>

                {step === 0 && (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                    <div className="border-b border-gray-900/10 pb-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">
                        Select Agency
                      </h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Choose an agency to proceed with your application.
                      </p>
                      <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                                Select
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                                Agency ID
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                                Agency Name
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                                Full Address
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {agencies.length > 0 ? (
                              agencies.map((agency) => (
                                <tr
                                  key={agency.AgencyID}
                                  className="border-b border-gray-200 hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2">
                                    <Field
                                      type="radio"
                                      name="AgencyID"
                                      value={agency.AgencyID}
                                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {agency.AgencyID}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {agency.AgencyName}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {agency.AgencyAddress?.Area
                                      ? `${agency.AgencyAddress.Building_Society_Name}, ${agency.AgencyAddress.Area}, ${agency.AgencyAddress.City}, ${agency.AgencyAddress.State}, ${agency.AgencyAddress.Pincode}`
                                      : "Address not available"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="px-4 py-2 text-center text-sm text-gray-500"
                                >
                                  No agencies available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        <ErrorMessage
                          name="AgencyID"
                          component="p"
                          className="mt-1 text-sm/6 text-red-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
                    <div className="border-b border-gray-900/10 pb-6 lg:border-b-0 lg:pb-0 lg:pr-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">
                        Personal Information
                      </h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Provide your personal details for the application.
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6">
                        <div className="col-span-full">
                          <label
                            htmlFor="StaffName"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Full Name
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="StaffName"
                              placeholder="Enter full name"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="StaffName"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full">
                          <label
                            htmlFor="DOB"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Date of Birth
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="date"
                              name="DOB"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="DOB"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full">
                          <label
                            htmlFor="StaffMobileNo"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Mobile Number
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="StaffMobileNo"
                              placeholder="Enter 10-digit mobile number"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="StaffMobileNo"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full">
                          <label
                            htmlFor="StaffEmail"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Email
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="email"
                              name="StaffEmail"
                              placeholder="Enter email"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="StaffEmail"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-gray-900/10 pb-6 lg:border-b-0 lg:pb-0 lg:pl-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">
                        Identification and Preferences
                      </h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Provide your Aadhar number, expected salary, and
                        preferred area.
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="col-span-full sm:col-span-1">
                          <label
                            htmlFor="AadharNumber"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Aadhar Number
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="AadharNumber"
                              placeholder="Enter 12-digit Aadhar number"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="AadharNumber"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full sm:col-span-1">
                          <label
                            htmlFor="Salary"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Expected Salary
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="number"
                              name="Salary"
                              placeholder="Enter salary"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="Salary"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full">
                          <label
                            htmlFor="AssignedArea"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Assigned Area (Optional)
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="AssignedArea"
                              placeholder="Enter assigned area"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="AssignedArea"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                    <div className="border-b border-gray-900/10 pb-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">
                        Address Information
                      </h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Provide your permanent address.
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="col-span-full sm:col-span-1">
                          <label
                            htmlFor="StaffAddress.FlatNo"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Flat No
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="StaffAddress.FlatNo"
                              placeholder="Enter flat number"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="StaffAddress.FlatNo"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full sm:col-span-1">
                          <label
                            htmlFor="StaffAddress.Building_Society_Name"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Building/Society Name
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="StaffAddress.Building_Society_Name"
                              placeholder="Enter building/society name"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="StaffAddress.Building_Society_Name"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full sm:col-span-1">
                          <label
                            htmlFor="StaffAddress.Area"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Area
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="StaffAddress.Area"
                              placeholder="Enter area"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="StaffAddress.Area"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full sm:col-span-1">
                          <label
                            htmlFor="StaffAddress.City"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            City
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="StaffAddress.City"
                              placeholder="Enter city"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="StaffAddress.City"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full sm:col-span-1">
                          <label
                            htmlFor="StaffAddress.State"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            State
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="StaffAddress.State"
                              placeholder="Enter state"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="StaffAddress.State"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                        <div className="col-span-full sm:col-span-1">
                          <label
                            htmlFor="StaffAddress.Pincode"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Pincode
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="StaffAddress.Pincode"
                              placeholder="Enter 6-digit pincode"
                              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                            />
                            <ErrorMessage
                              name="StaffAddress.Pincode"
                              component="p"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                    <div className="border-b border-gray-900/10 pb-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">
                        Upload Documents
                      </h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Upload required documents (all fields are mandatory).
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="AadharDocument"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Aadhar Document *
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              name="AadharDocument"
                              id="AadharDocument"
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.AadharDocument && (
                              <p className="mt-1 text-sm text-gray-600">
                                Selected: {files.AadharDocument.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="StaffPhoto"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Staff Photo *
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              name="StaffPhoto"
                              id="StaffPhoto"
                              onChange={handleFileChange}
                              accept=".jpg,.jpeg,.png"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.StaffPhoto && (
                              <p className="mt-1 text-sm text-gray-600">
                                Selected: {files.StaffPhoto.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="StaffSignature"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Staff Signature *
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              name="StaffSignature"
                              id="StaffSignature"
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.StaffSignature && (
                              <p className="mt-1 text-sm text-gray-600">
                                Selected: {files.StaffSignature.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end gap-x-4">
                  <button
                    type="button"
                    className="text-sm/6 font-semibold text-gray-900"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </button>
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                    >
                      Previous
                    </button>
                  )}
                  {step < 3 && (
                    <button
                      type="button"
                      onClick={() => handleNext(values)}
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      {step === 0 ? "Proceed" : "Next"}
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : "Apply for Delivery Staff"}
                    </button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default ApplyDeliveryStaffForm;
