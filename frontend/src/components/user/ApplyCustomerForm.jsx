import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applyCustomerSchema } from '../../utils/validations';
import { applyForCustomer, fetchAgencies } from '../../ReduxStore/slices/userSlice';

const ApplyCustomerForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { agencies, loading, error } = useSelector((state) => state.user);
  const [files, setFiles] = useState({
    AadharDocument: null,
    AddressProofDocument: null,
    BankDocument: null,
    ProfilePic: null,
    Signature: null, // Added Signature to state
  });
  const [step, setStep] = useState(0);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchAgencies());
  }, [dispatch]);

  const initialValues = {
    CustomerName: '',
    DOB: '',
    CustomerMobileNo: '',
    CustomerEmailId: '',
    Connection_Mode: 'Regular',
    CustomerAddress: {
      FlatNo: '',
      Building_Society_Name: '',
      Area: '',
      City: '',
      State: '',
      Pincode: '',
    },
    AadharNumber: '',
    AddressProof: '',
    Bank: {
      BankName: '',
      AccountNumber: '',
      IFSC: '',
      Branch: '',
    },
    Alloted_Cylinder: 1,
    AgencyID: '',
    // Removed CustomerSign as it's not used by the backend
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    setFiles((prev) => ({ ...prev, [name]: file }));
    console.log(`File selected for ${name}:`, file ? file.name : 'None');
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const missingFiles = [];
      if (!files.AadharDocument) missingFiles.push('Aadhar Document');
      if (!files.AddressProofDocument) missingFiles.push('Address Proof Document');
      if (!files.BankDocument) missingFiles.push('Bank Document');
      if (!files.ProfilePic) missingFiles.push('Profile Picture');
      if (!files.Signature) missingFiles.push('Signature'); // Added Signature validation
      if (missingFiles.length > 0) {
        toast.error(`Please upload the following required documents: ${missingFiles.join(', ')}`);
        setSubmitting(false);
        return;
      }

      console.log('Submitting form with values:', JSON.stringify(values, null, 2));
      const formData = new FormData();
      formData.append('CustomerName', values.CustomerName.trim());
      formData.append('DOB', values.DOB);
      formData.append('CustomerMobileNo', values.CustomerMobileNo);
      formData.append('CustomerEmailId', values.CustomerEmailId.trim()); // Match backend field name
      formData.append('Connection_Mode', values.Connection_Mode);
      formData.append('CustomerAddress', JSON.stringify({
        FlatNo: values.CustomerAddress.FlatNo,
        Building_Society_Name: values.CustomerAddress.Building_Society_Name.trim(),
        Area: values.CustomerAddress.Area.trim(),
        City: values.CustomerAddress.City.trim(),
        State: values.CustomerAddress.State.trim(),
        Pincode: values.CustomerAddress.Pincode,
      }));
      formData.append('AadharNumber', values.AadharNumber);
      formData.append('AddressProof', values.AddressProof);
      formData.append('Bank', JSON.stringify({
        BankName: values.Bank.BankName.trim(),
        AccountNumber: values.Bank.AccountNumber,
        IFSC: values.Bank.IFSC.trim(),
        Branch: values.Bank.Branch.trim(),
      }));
      formData.append('Alloted_Cylinder', values.Alloted_Cylinder);
      formData.append('AgencyID', values.AgencyID.trim());
      // Removed CustomerSign as it's not needed
      formData.append('AadharDocument', files.AadharDocument);
      formData.append('AddressProofDocument', files.AddressProofDocument);
      formData.append('BankDocument', files.BankDocument);
      formData.append('ProfilePic', files.ProfilePic);
      formData.append('Signature', files.Signature); // Added Signature file

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? value.name : value}`);
      }

      console.log('Dispatching applyForCustomer...');
      const response = await dispatch(applyForCustomer(formData)).unwrap();
      console.log('API Response:', JSON.stringify(response, null, 2));
      setApplicationDetails(response);
      setShowSuccess(true);
      toast.success('Customer application submitted successfully');
      resetForm();
      setFiles({
        AadharDocument: null,
        AddressProofDocument: null,
        BankDocument: null,
        ProfilePic: null,
        Signature: null, // Reset Signature
      });
      setStep(0);
    } catch (error) {
      const errorMessage = error.message || 'Failed to submit application';
      console.error('Submission Error:', {
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
      toast.error('Please select an agency to proceed');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
  };

  const handleProceedToStatus = () => {
    setShowSuccess(false);
    navigate('/check-application-status');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
            <h3 className="text-lg font-semibold text-green-700">{applicationDetails.message}</h3>
            <div className="mt-4">
              <p className="text-sm">
                <strong>Registration ID:</strong> {applicationDetails.customer.RegistrationID}
              </p>
              <p className="text-sm">
                <strong>Application Status:</strong> {applicationDetails.customer.Approval_Status} (
                {applicationDetails.customer.State_Of_Approve})
              </p>
              <p className="text-sm">
                <strong>Applied Date:</strong> {formatDate(applicationDetails.customer.Applied_Date)}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-base font-semibold text-gray-900">Customer Information</h4>
              <p className="text-sm">
                <strong>Name:</strong> {applicationDetails.customer.CustomerName}
              </p>
              <p className="text-sm">
                <strong>Date of Birth:</strong> {formatDate(applicationDetails.customer.DOB)}
              </p>
              <p className="text-sm">
                <strong>Mobile Number:</strong> {applicationDetails.customer.CustomerMobileNo}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {applicationDetails.customer.CustomerEmailId}
              </p>
              <p className="text-sm">
                <strong>Address:</strong>{' '}
                {applicationDetails.customer.CustomerAddress.FlatNo
                  ? `Flat No ${applicationDetails.customer.CustomerAddress.FlatNo}, `
                  : ''}
                {applicationDetails.customer.CustomerAddress.Building_Society_Name
                  ? `${applicationDetails.customer.CustomerAddress.Building_Society_Name}, `
                  : ''}
                {applicationDetails.customer.CustomerAddress.Area},{' '}
                {applicationDetails.customer.CustomerAddress.City},{' '}
                {applicationDetails.customer.CustomerAddress.State},{' '}
                {applicationDetails.customer.CustomerAddress.Pincode}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-base font-semibold text-gray-900">Application Details</h4>
              <p className="text-sm">
                <strong>Connection Mode:</strong> {applicationDetails.customer.Connection_Mode}
              </p>
              <p className="text-sm">
                <strong>Aadhar Number:</strong> {applicationDetails.customer.AadharNumber}
              </p>
              <p className="text-sm">
                <strong>Address Proof:</strong> {applicationDetails.customer.AddressProof}
              </p>
              <p className="text-sm">
                <strong>Allotted Cylinder:</strong> {applicationDetails.customer.Alloted_Cylinder}
              </p>
              <p className="text-sm">
                <strong>Agency ID:</strong> {applicationDetails.customer.AgencyID}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-base font-semibold text-gray-900">Bank Details</h4>
              <p className="text-sm">
                <strong>Bank Name:</strong> {applicationDetails.customer.Bank.BankName}
              </p>
              <p className="text-sm">
                <strong>Account Number:</strong> {applicationDetails.customer.Bank.AccountNumber}
              </p>
              <p className="text-sm">
                <strong>IFSC Code:</strong> {applicationDetails.customer.Bank.IFSC}
              </p>
              <p className="text-sm">
                <strong>Branch:</strong> {applicationDetails.customer.Bank.Branch || 'N/A'}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-base font-semibold text-gray-900">Uploaded Documents</h4>
              <ul className="list-disc list-inside text-sm">
                {applicationDetails.uploadedDocuments.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <h4 className="text-base font-semibold text-gray-900">Cost Breakdown</h4>
              <table className="min-w-full border border-gray-300 mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                      Item
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                      Cost (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">Cylinder Cost</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {applicationDetails.costBreakdown.cylinderCost}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">Security Deposit (Cylinder)</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {applicationDetails.costBreakdown.securityDepositCylinder}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">Security Deposit (Pressure Regulator)</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {applicationDetails.costBreakdown.securityDepositPressureRegulator}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">Installation and Demo</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {applicationDetails.costBreakdown.installationAndDemo}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">DGCC</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {applicationDetails.costBreakdown.dgcc}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">Visit Charge</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {applicationDetails.costBreakdown.visitCharge}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">Additional Fixed Charge</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {applicationDetails.costBreakdown.additionalFixedCharge}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">Extra Charge</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {applicationDetails.costBreakdown.extraCharge}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 font-semibold">
                    <td className="px-4 py-2 text-sm text-gray-900">Total Cost</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {applicationDetails.costBreakdown.totalCost}
                    </td>
                  </tr>
                </tbody>
              </table>
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
            validationSchema={applyCustomerSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="space-y-6">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    1
                  </div>
                  <div className="w-12 h-1 bg-gray-200 mx-2"></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </div>
                  <div className="w-12 h-1 bg-gray-200 mx-2"></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    3
                  </div>
                  <div className="w-12 h-1 bg-gray-200 mx-2"></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    4
                  </div>
                </div>

                {step === 0 && (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                    <div className="border-b border-gray-900/10 pb-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">Select Agency</h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Choose an agency to proceed with your application.
                      </p>
                      <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">Select</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">Agency ID</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">Agency Name</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b border-gray-300">Full Address</th>
                            </tr>
                          </thead>
                          <tbody>
                            {agencies.length > 0 ? (
                              agencies.map((agency) => (
                                <tr key={agency.AgencyID} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="px-4 py-2">
                                    <Field
                                      type="radio"
                                      name="AgencyID"
                                      value={agency.AgencyID}
                                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{agency.AgencyID}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{agency.AgencyName}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {agency.AgencyAddress?.Area
                                      ? `${agency.AgencyAddress.Area}, ${agency.AgencyAddress.City}, ${agency.AgencyAddress.State}, ${agency.AgencyAddress.Pincode}`
                                      : 'Address not available'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="px-4 py-2 text-center text-sm text-gray-500">
                                  No agencies available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        <ErrorMessage name="AgencyID" component="p" className="mt-1 text-sm/6 text-red-600" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
                    <div className="border-b border-gray-900/10 pb-6 lg:border-b-0 lg:pb-0 lg:border-r lg:pr-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">Customer Information</h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Customer details for verification
                      </p>
                      <div className="sm:col-span-4">
                        <label htmlFor="Connection_Mode" className="block text-sm/6 font-medium text-gray-900">
                          Connection Mode
                        </label>
                        <div className="mt-0.5">
                          <Field
                            as="select"
                            name="Connection_Mode"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          >
                            <option value="Regular">Regular</option>
                            <option value="Commercial">Commercial</option>
                          </Field>
                          <ErrorMessage name="Connection_Mode" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label htmlFor="CustomerName" className="block text-sm/6 font-medium text-gray-900">
                            Full Name
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="CustomerName"
                              placeholder="Enter full name"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="CustomerName" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="DOB" className="block text-sm/6 font-medium text-gray-900">
                            Date of Birth
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="date"
                              name="DOB"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="DOB" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="CustomerMobileNo" className="block text-sm/6 font-medium text-gray-900">
                            Phone Number
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="CustomerMobileNo"
                              placeholder="Enter 10-digit phone number"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="CustomerMobileNo" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="CustomerEmailId" className="block text-sm/6 font-medium text-gray-900">
                            Email
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="email"
                              name="CustomerEmailId"
                              placeholder="Enter email"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="CustomerEmailId" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-gray-900/10 pb-6 lg:border-b-0 lg:pb-0 lg:pl-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">Address Information</h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Customer's permanent contact address
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="CustomerAddress.FlatNo" className="block text-sm/6 font-medium text-gray-900">
                            Flat No
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="CustomerAddress.FlatNo"
                              placeholder="Enter flat number"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="CustomerAddress.FlatNo" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-3">
                          <label htmlFor="CustomerAddress.Building_Society_Name" className="block text-sm/6 font-medium text-gray-900">
                            Building/Society Name
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="CustomerAddress.Building_Society_Name"
                              placeholder="Enter building/society name"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="CustomerAddress.Building_Society_Name" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="col-span-full">
                          <label htmlFor="CustomerAddress.Area" className="block text-sm/6 font-medium text-gray-900">
                            Area
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="CustomerAddress.Area"
                              placeholder="Enter area"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="CustomerAddress.Area" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-2 sm:col-start-1">
                          <label htmlFor="CustomerAddress.City" className="block text-sm/6 font-medium text-gray-900">
                            City
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="CustomerAddress.City"
                              placeholder="Enter city"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="CustomerAddress.City" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="CustomerAddress.State" className="block text-sm/6 font-medium text-gray-900">
                            State
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="CustomerAddress.State"
                              placeholder="Enter state"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="CustomerAddress.State" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="CustomerAddress.Pincode" className="block text-sm/6 font-medium text-gray-900">
                            Pincode
                          </label>
                          <div className="mt-0.5">
                            <Field
                              type="text"
                              name="CustomerAddress.Pincode"
                              placeholder="Enter 6-digit pincode"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="CustomerAddress.Pincode" component="p" className="mt-0.5 text-sm/6 text-red-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                    <div className="border-b border-gray-900/10 pb-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">Bank Information</h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Provide bank details for payment processing.
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label htmlFor="Bank.BankName" className="block text-sm/6 font-medium text-gray-900">
                            Bank Name
                          </label>
                          <div className="mt-1">
                            <Field
                              type="text"
                              name="Bank.BankName"
                              placeholder="Enter bank name"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="Bank.BankName" component="p" className="mt-1 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="Bank.AccountNumber" className="block text-sm/6 font-medium text-gray-900">
                            Account Number
                          </label>
                          <div className="mt-1">
                            <Field
                              type="text"
                              name="Bank.AccountNumber"
                              placeholder="Enter account number (max 15 digits)"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="Bank.AccountNumber" component="p" className="mt-1 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="Bank.IFSC" className="block text-sm/6 font-medium text-gray-900">
                            IFSC Code
                          </label>
                          <div className="mt-1">
                            <Field
                              type="text"
                              name="Bank.IFSC"
                              placeholder="Enter IFSC code (e.g., SBIN0001234)"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="Bank.IFSC" component="p" className="mt-1 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="Bank.Branch" className="block text-sm/6 font-medium text-gray-900">
                            Branch
                          </label>
                          <div className="mt-1">
                            <Field
                              type="text"
                              name="Bank.Branch"
                              placeholder="Enter branch name"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="Bank.Branch" component="p" className="mt-1 text-sm/6 text-red-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
                    <div className="border-b border-gray-900/10 pb-6 lg:border-b-0 lg:pb-0 lg:border-r lg:pr-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">Documents & Other Details</h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Provide identification details.
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label htmlFor="AadharNumber" className="block text-sm/6 font-medium text-gray-900">
                            Aadhar Number
                          </label>
                          <div className="mt-1">
                            <Field
                              type="text"
                              name="AadharNumber"
                              placeholder="Enter 12-digit Aadhar number"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="AadharNumber" component="p" className="mt-1 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="AddressProof" className="block text-sm/6 font-medium text-gray-900">
                            Address Proof Type
                          </label>
                          <div className="mt-1">
                            <Field
                              as="select"
                              name="AddressProof"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            >
                              <option value="">Select address proof</option>
                              <option value="AadharCard">Aadhar Card</option>
                              <option value="VoterID">Voter ID</option>
                              <option value="DrivingLicense">Driving License</option>
                              <option value="Lightbill">Light Bill</option>
                              <option value="Rent-Agreement">Rent Agreement</option>
                              <option value="Rashan-card">Ration Card</option>
                              <option value="Title-Paper">Title Paper</option>
                              <option value="Tax-Bill">Tax Bill</option>
                              <option value="Sale-Deed">Sale Deed</option>
                            </Field>
                            <ErrorMessage name="AddressProof" component="p" className="mt-1 text-sm/6 text-red-600" />
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="Alloted_Cylinder" className="block text-sm/6 font-medium text-gray-900">
                            Number of Cylinders
                          </label>
                          <div className="mt-1">
                            <Field
                              type="number"
                              name="Alloted_Cylinder"
                              min="1"
                              max="2"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                            <ErrorMessage name="Alloted_Cylinder" component="p" className="mt-1 text-sm/6 text-red-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-gray-900/10 pb-6 lg:border-b-0 lg:pb-0 lg:pl-6">
                      <h2 className="text-base/7 font-semibold text-gray-900">Upload Documents</h2>
                      <p className="mt-1 text-sm/6 text-gray-600">
                        Upload required documents (all fields are mandatory).
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label htmlFor="AadharDocument" className="block text-sm/6 font-medium text-gray-900">
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
                            {files.AadharDocument && <p className="mt-1 text-sm text-gray-600">Selected: {files.AadharDocument.name}</p>}
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="AddressProofDocument" className="block text-sm/6 font-medium text-gray-900">
                            Address Proof Document *
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              name="AddressProofDocument"
                              id="AddressProofDocument"
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.AddressProofDocument && <p className="mt-1 text-sm text-gray-600">Selected: {files.AddressProofDocument.name}</p>}
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="BankDocument" className="block text-sm/6 font-medium text-gray-900">
                            Bank Document *
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              name="BankDocument"
                              id="BankDocument"
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.BankDocument && <p className="mt-1 text-sm text-gray-600">Selected: {files.BankDocument.name}</p>}
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="ProfilePic" className="block text-sm/6 font-medium text-gray-900">
                            Profile Picture *
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              name="ProfilePic"
                              id="ProfilePic"
                              onChange={handleFileChange}
                              accept=".jpg,.jpeg,.png"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.ProfilePic && <p className="mt-1 text-sm text-gray-600">Selected: {files.ProfilePic.name}</p>}
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label htmlFor="Signature" className="block text-sm/6 font-medium text-gray-900">
                            Signature *
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              name="Signature"
                              id="Signature"
                              onChange={handleFileChange}
                              accept=".jpg,.jpeg,.png"
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.Signature && <p className="mt-1 text-sm text-gray-600">Selected: {files.Signature.name}</p>}
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
                    onClick={() => navigate('/')}
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
                      {step === 0 ? 'Proceed' : 'Next'}
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Apply for Customer'}
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

export default ApplyCustomerForm;