const Customer = require('../Models/CustomerModel');
const CustomerConnectionModel = require('../Models/CustomerConnectionModel');
const User = require('../Models/UserModel');
const AgencyModel = require('../Models/AgencyModel');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mongoose = require("mongoose");
const DeliveryStaffModel = require('../Models/DeliveryStaff');
// Try to import constants, with fallback

let CYLINDER_TYPES, SECURITY_DEPOSITS, CHARGES;
try {
  const constants = require('../Models/constants');
  CYLINDER_TYPES = constants.CYLINDER_TYPES;
  SECURITY_DEPOSITS = constants.SECURITY_DEPOSITS;
  CHARGES = constants.CHARGES;
} catch (error) {
  console.error('Failed to load constants:', error.message);
  CYLINDER_TYPES = {
    "14.2kg_NonSubsidised_DBTL": 850,
  };
  SECURITY_DEPOSITS = {
    Domestic: {
      "14.2kg": 2200,
      Pressure_Regulator: 150,
    },
  };
  CHARGES = {
    InstallationAndDemo: { Domestic: { regular: 118, PMUY: 75 } },
    DGCC: { Domestic: { regular: 59, PMUY: 25 } },
    VisitCharge: { Domestic: 250 },
    AdditionalFixedCharge: 60,
    ExtraCharge: 250,
  };
}

const createDirectory = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
};

const parseJsonField = (field, fieldName) => {
  if (!field) {
    throw new Error(`${fieldName} is required`);
  }
  try {
    return JSON.parse(field);
  } catch (error) {
    throw new Error(`Invalid JSON format for ${fieldName}: ${error.message}`);
  }
};

const calculatePendingPayment = async (connectionMode, allotedCylinder, agencyID) => {
  try {
    const agency = await AgencyModel.findOne({ AgencyID: agencyID });
    if (!agency) {
      throw new Error(`Agency not found for AgencyID: ${agencyID}`);
    }
    if (!CYLINDER_TYPES || !SECURITY_DEPOSITS || !CHARGES) {
      throw new Error('Cost constants are not defined');
    }
    const connectionType = connectionMode === 'Regular' ? 'Domestic' : 'Commercial';
    const ConnectionDetails = {
      ProductType: '14.2kg_NonSubsidised_DBTL',
      CylinderSize: '14.2kg',
      NumberOfCylinders: allotedCylinder,
      IsPMUY: false,
      HasLOTValve: false,
    };

    const customerConnection = new CustomerConnectionModel({
      CustomerID: '',
      ConnectionType: connectionType,
      Status: 'Pending',
      ProductType: ConnectionDetails.ProductType,
      CylinderPrice: CYLINDER_TYPES[ConnectionDetails.ProductType] || 0,
      CylinderSize: ConnectionDetails.CylinderSize,
      NumberOfCylinders: ConnectionDetails.NumberOfCylinders || 1,
      IsPMUY: ConnectionDetails.ProductType === '14.2kg_Subsidised_DBTLExempted' ? true : ConnectionDetails.IsPMUY || false,
      HasLOTValve: ConnectionDetails.HasLOTValve || false,
      AgencyID: agencyID,
      AgencyName: agency.AgencyName || 'Unknown Agency',
    });

    const breakdown = {
      cylinderCost: customerConnection.CylinderPrice * customerConnection.NumberOfCylinders,
      securityDepositCylinder: SECURITY_DEPOSITS[connectionType][customerConnection.CylinderSize] || 0,
      securityDepositPressureRegulator: SECURITY_DEPOSITS[connectionType].Pressure_Regulator || 0,
      installationAndDemo: customerConnection.IsPMUY
        ? CHARGES.InstallationAndDemo[connectionType].PMUY
        : CHARGES.InstallationAndDemo[connectionType].regular,
      dgcc: customerConnection.IsPMUY
        ? CHARGES.DGCC[connectionType].PMUY
        : CHARGES.DGCC[connectionType].regular,
      visitCharge: CHARGES.VisitCharge[connectionType],
      additionalFixedCharge: CHARGES.AdditionalFixedCharge,
      extraCharge: CHARGES.ExtraCharge,
      totalCost: 0,
    };

    breakdown.totalCost =
      breakdown.cylinderCost +
      breakdown.securityDepositCylinder +
      breakdown.securityDepositPressureRegulator +
      breakdown.installationAndDemo +
      breakdown.dgcc +
      breakdown.visitCharge +
      breakdown.additionalFixedCharge +
      breakdown.extraCharge;

    console.log(`Cost Breakdown for ${customerConnection.NumberOfCylinders} cylinder(s):`, breakdown);
    return { totalCost: breakdown.totalCost, breakdown };
  } catch (error) {
    throw new Error(`Failed to calculate pending payment: ${error.message}`);
  }
};

exports.applyForConnection = async (req, res) => {
  let customer = null;
  let uploadPath = null;
  try {
    console.log('Incoming request body:', req.body);
    console.log('Incoming files keys:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Incoming files structure:', JSON.stringify(req.files, null, 2));

    const {
      CustomerName,
      DOB,
      CustomerMobileNo,
      CustomerEmailId,
      Connection_Mode,
      CustomerAddress,
      AadharNumber,
      AddressProof,
      Bank,
      Alloted_Cylinder,
      AgencyID,
      CustomerSign, // Note: This may not be needed if signature is only in files
    } = req.body;

    // Validate required fields
    if (
      !CustomerName ||
      !DOB ||
      !CustomerMobileNo ||
      !CustomerEmailId.trim() === '' ||
      !Connection_Mode ||
      !CustomerAddress ||
      !AadharNumber ||
      !AddressProof ||
      !Bank ||
      !Alloted_Cylinder ||
      !AgencyID
    ) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate required files
    if (!req.files) {
      console.error('No files uploaded:', { files: req.files });
      return res.status(400).json({ message: 'No files uploaded. All required documents must be provided' });
    }

    // Define expected file fields and their corresponding schema fields
    const fileFieldMap = {
      AadharDocument: 'AadharDocument',
      AddressProofDocument: 'AddressProofDocument',
      BankDocument: 'BankDocument',
      ProfilePic: 'ProfilePic',
      Signature: 'SignatureDocument', // Map 'Signature' (or other client-side key) to 'SignatureDocument'
    };

    // Validate required files
    const missingFiles = [];
    for (const clientField of Object.keys(fileFieldMap)) {
      if (!req.files[clientField] || !Array.isArray(req.files[clientField]) || req.files[clientField].length === 0) {
        missingFiles.push(clientField);
      }
    }
    if (missingFiles.length > 0) {
      console.error('Missing or invalid files:', { missingFiles });
      return res.status(400).json({ message: `Missing or invalid files: ${missingFiles.join(', ')}` });
    }

    // Normalize and trim inputs
    const normalizedCustomerName = CustomerName.trim();
    const normalizedCustomerEmailId = CustomerEmailId ? CustomerEmailId.trim() : null;
if (!normalizedCustomerEmailId || !/^\S+@\S+\.\S+$/.test(normalizedCustomerEmailId)) {
  return res.status(400).json({ message: 'Valid CustomerEmailId is required' });
}
    const normalizedConnectionMode = Connection_Mode.trim();
    const normalizedCustomerMobileNo = CustomerMobileNo.toString().trim();
    const normalizedAadharNumber = AadharNumber.toString().trim();
    const normalizedAgencyID = AgencyID.trim();
    let normalizedAddressProof = AddressProof.trim();

    // Validate numeric fields
    if (isNaN(normalizedCustomerMobileNo) || normalizedCustomerMobileNo.length !== 10) {
      return res.status(400).json({ message: 'CustomerMobileNo must be a 10-digit number' });
    }
    if (isNaN(normalizedAadharNumber) || normalizedAadharNumber.length !== 12) {
      return res.status(400).json({ message: 'AadharNumber must be a 12-digit number' });
    }

    // Map address proof types
    const addressProofMap = {
      lightbill: 'Lightbill',
      'driving-license': 'DrivingLicense',
      'rent-agreement': 'Rent-Agreement',
      'rashan-card': 'Rashan-card',
      'title-paper': 'Title-Paper',
      'tax-bill': 'Tax-Bill',
      'sale-deed': 'Sale-Deed',
      aadhar: 'AadharCard',
      voterid: 'VoterID',
      drivinglicense: 'DrivingLicense',
    };
    normalizedAddressProof = addressProofMap[AddressProof.toLowerCase()] || AddressProof;

    // Parse JSON fields
    let parsedCustomerAddress, parsedBank;
    try {
      parsedCustomerAddress = parseJsonField(CustomerAddress, 'CustomerAddress');
      parsedBank = parseJsonField(Bank, 'Bank');
      if (parsedBank.Account_Number) {
        parsedBank.AccountNumber = parsedBank.Account_Number.toString();
        delete parsedBank.Account_Number;
      }
      if (parsedBank.AccountNumber) {
        parsedBank.AccountNumber = parsedBank.AccountNumber.toString();
      }
      if (parsedCustomerAddress.Pincode) {
        parsedCustomerAddress.Pincode = parsedCustomerAddress.Pincode.toString();
      }
    
      if (isNaN(parsedCustomerAddress.Pincode) || parsedCustomerAddress.Pincode.length !== 6) {
        return res.status(400).json({ message: 'Pincode must be a 6-digit number' });
      }
      if (isNaN(parsedBank.AccountNumber) || parsedBank.AccountNumber.length > 15) {
        return res.status(400).json({ message: 'AccountNumber must be a number up to 15 digits' });
      }
    } catch (error) {
      console.error('JSON parsing error:', error.message);
      return res.status(400).json({ message: error.message });
    }

    // Validate agency
    let agency;
    try {
      agency = await AgencyModel.findOne({ AgencyID: normalizedAgencyID });
      if (!agency) {
        return res.status(404).json({ message: `Agency not found for AgencyID: ${normalizedAgencyID}` });
      }
    } catch (error) {
      console.error('Agency lookup error:', error.message);
      return res.status(500).json({ message: `Failed to validate agency: ${error.message}` });
    }

    // Validate DOB
    const dobDate = new Date(DOB);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ message: 'Invalid DOB format' });
    }

    // Calculate payment details
    let paymentDetails;
    try {
      paymentDetails = await calculatePendingPayment(
        normalizedConnectionMode,
        parseInt(Alloted_Cylinder),
        normalizedAgencyID
      );
    } catch (error) {
      console.error('Payment calculation error:', error.message);
      return res.status(500).json({ message: error.message });
    }

    // Create temporary customer with all required fields
    try {
      customer = new Customer({
        UserID: req.user ? req.user._id : new mongoose.Types.ObjectId(),
        CustomerName: normalizedCustomerName,
        DOB: dobDate,
        CustomerMobileNo: parseInt(normalizedCustomerMobileNo),
        CustomerEmailId: normalizedCustomerEmailId,
        Connection_Mode: normalizedConnectionMode,
        CustomerAddress: parsedCustomerAddress,
        AadharNumber: parseInt(normalizedAadharNumber),
        AddressProof: normalizedAddressProof,
        Bank: parsedBank,
        Alloted_Cylinder: parseInt(Alloted_Cylinder),
        Remaining_Cylinder: parseInt(Alloted_Cylinder),
        Payment: 0,
        Pending_Payment: paymentDetails.totalCost,
        AgencyID: normalizedAgencyID,
        AadharDocument: 'temp-aadhar.pdf',
        AddressProofDocument: 'temp-addressproof.pdf',
        BankDocument: 'temp-bankdocument.pdf',
        ProfilePic: 'temp-profilepic.jpg',
        SignatureDocument: 'temp-signature.jpg',
      });

      await customer.save();
      console.log('Temporary customer document:', customer.toObject());
      console.log(`Generated RegistrationID: ${customer.RegistrationID}`);
    } catch (error) {
      console.error('Temporary customer save error:', error.message);
      return res.status(500).json({ message: `Failed to generate RegistrationID: ${error.message}` });
    }

    // Handle file uploads using RegistrationID
    const registrationID = customer.RegistrationID;
    uploadPath = path.join(__dirname, '..', 'Uploads', registrationID);
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`Created upload directory: ${uploadPath}`);
    } catch (error) {
      console.error('Directory creation error:', error.message);
      await Customer.deleteOne({ _id: customer._id });
      return res.status(500).json({ message: `Directory creation failed: ${error.message}` });
    }

    const files = req.files;
    const documentMap = {
      AadharDocument: `${registrationID}-aadhar`,
      AddressProofDocument: `${registrationID}-addressproof`,
      BankDocument: `${registrationID}-bankdocument`,
      ProfilePic: `${registrationID}-profilepic`,
      Signature: `${registrationID}-signature`, // Map client-side 'Signature' to schema field
    };
    const uploadedDocuments = {};
    try {
      for (const clientField of Object.keys(documentMap)) {
        if (!files[clientField] || !Array.isArray(files[clientField]) || files[clientField].length === 0) {
          throw new Error(`Missing or invalid file for ${clientField}`);
        }
        const file = files[clientField][0];
        const fileName = `${documentMap[clientField]}${path.extname(file.originalname)}`;
        const finalPath = path.join(uploadPath, fileName);
        fs.renameSync(file.path, finalPath);
        // Map client-side field to schema field
        const schemaField = fileFieldMap[clientField] || clientField;
        uploadedDocuments[schemaField] = fileName;
        console.log(`Uploaded file: ${clientField} -> ${fileName}`);
      }
    } catch (error) {
      console.error('File handling error:', error.message);
      if (fs.existsSync(uploadPath)) {
        fs.rmSync(uploadPath, { recursive: true, force: true });
      }
      await Customer.deleteOne({ _id: customer._id });
      return res.status(500).json({ message: `Failed to process files: ${error.message}` });
    }

    // Update customer with final document paths
    try {
      console.log('Updating customer with documents:', uploadedDocuments);
      customer.set(uploadedDocuments); // Use mapped schema field names
      console.log('Customer before save:', customer.toObject());
      await customer.save();
      const updatedCustomer = await Customer.findById(customer._id);
      console.log('Customer after save:', updatedCustomer.toObject());

      // Validate document paths
      if (
        !updatedCustomer.AadharDocument ||
        updatedCustomer.AadharDocument.startsWith('temp-') ||
        !updatedCustomer.AddressProofDocument ||
        updatedCustomer.AddressProofDocument.startsWith('temp-') ||
        !updatedCustomer.BankDocument ||
        updatedCustomer.BankDocument.startsWith('temp-') ||
        !updatedCustomer.ProfilePic ||
        updatedCustomer.ProfilePic.startsWith('temp-') ||
        !updatedCustomer.SignatureDocument ||
        updatedCustomer.SignatureDocument.startsWith('temp-')
      ) {
        throw new Error('Document paths not updated correctly');
      }
    } catch (error) {
      console.error('Customer update error:', error.message);
      if (fs.existsSync(uploadPath)) {
        fs.rmSync(uploadPath, { recursive: true, force: true });
      }
      await Customer.deleteOne({ _id: customer._id });
      return res.status(500).json({ message: `Failed to update customer: ${error.message}` });
    }

    // Clean up temp directory
    const tempPath = path.join(__dirname, '..', 'Uploads', 'Customer');
    try {
      if (fs.existsSync(tempPath) && fs.readdirSync(tempPath).length === 0) {
        fs.rmdirSync(tempPath);
      }
    } catch (error) {
      console.warn('Failed to clean up temp directory:', error.message);
    }

    res.status(201).json({
      message: 'Connection application submitted successfully (pending approval)',
      customer,
      uploadedDocuments: Object.values(uploadedDocuments),
      costBreakdown: paymentDetails.breakdown,
    });
  } catch (error) {
    console.error('Apply for connection error:', error.stack);
    if (customer && customer.RegistrationID) {
      const uploadPath = path.join(__dirname, '..', 'Uploads', customer.RegistrationID);
      if (fs.existsSync(uploadPath)) {
        fs.rmSync(uploadPath, { recursive: true, force: true });
      }
      try {
        await Customer.deleteOne({ _id: customer._id });
      } catch (deleteError) {
        console.error('Failed to delete customer on error:', deleteError.message);
      }
    }
    const tempPath = path.join(__dirname, '..', 'Uploads', 'Customer');
    if (fs.existsSync(tempPath)) {
      try {
        fs.readdirSync(tempPath).forEach((file) => fs.unlinkSync(path.join(tempPath, file)));
        if (fs.readdirSync(tempPath).length === 0) {
          fs.rmdirSync(tempPath);
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temp files:', cleanupError.message);
      }
    }
    return res.status(500).json({ message: `Error applying for connection: ${error.message}` });
  }
};
exports.getAgencies = async (req, res) => {
  try {
    // Optional: Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No valid token provided',
      });
    }

    // Fetch only approved agencies
    const agencies = await AgencyModel.find(
      { Approval_Status: 'Approved' }
    ).select('AgencyID AgencyName AgencyAddress');

    // Format response data
    const formatted = agencies.map(agency => ({
      AgencyID: agency.AgencyID,
      AgencyName: agency.AgencyName,
      AgencyAddress: agency.AgencyAddress,
    }));

    res.status(200).json({
      success: true,
      message: agencies.length ? 'Approved agencies retrieved successfully' : 'No approved agencies found',
      data: formatted,
    });

  } catch (error) {
    console.error('Error fetching approved agencies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.applyAgency = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user._id) {
      console.error('Authentication failed: req.user is undefined or missing _id', { user: req.user });
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated',
      });
    }
    console.log('Authenticated user:', { userId: req.user._id, role: req.user.role });

    // Check for empty or missing body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body is empty or missing',
      });
    }

    // Validate required fields
    const { AgencyName, AgencyEmail, AgencyMobileNo, Gst_NO, AgencyAddress } = req.body;

    if (!AgencyName || !AgencyEmail || !AgencyMobileNo || !Gst_NO) {
      return res.status(400).json({
        success: false,
        error: 'AgencyName, AgencyEmail, AgencyMobileNo, and Gst_NO are required',
      });
    }

    if (
      !AgencyAddress ||
      !AgencyAddress.State ||
      !AgencyAddress.City ||
      !AgencyAddress.Area ||
      !AgencyAddress.Pincode
    ) {
      return res.status(400).json({
        success: false,
        error: 'AgencyAddress (Area, City, State, Pincode) is required',
      });
    }

    // Validate formats
    if (!/^\S+@\S+\.\S+$/.test(AgencyEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid AgencyEmail format',
      });
    }

    if (!/^\d{10}$/.test(AgencyMobileNo)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid AgencyMobileNo format (must be 10 digits)',
      });
    }

    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(Gst_NO)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Gst_NO format',
      });
    }

    if (!/^[0-9]{6}$/.test(AgencyAddress.Pincode.toString())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Pincode format (must be 6 digits)',
      });
    }

    // Check for existing agency with the same email
    const existingAgency = await AgencyModel.findOne({ AgencyEmail });
    if (existingAgency) {
      return res.status(400).json({
        success: false,
        error: 'Agency email already exists. Please use a different email.',
      });
    }

    // Construct agency data
    const agencyData = {
      AgencyName,
      AgencyEmail,
      AgencyMobileNo,
      Gst_NO,
      AgencyAddress,
      UserID: req.user._id,
      Received_Payment: 0,
      Pending_Payment: 0,
      Total_Customer: 0,
      Approval_Status: 'Pending',
      Applied_Date: Date.now(),
    };

    // Create and save agency document
    const agency = new AgencyModel(agencyData);
    await agency.save();
    console.log('Agency created:', {
      RegistrationID: agency.RegistrationID,
      AgencyName,
      UserID: agency.UserID,
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: `Agency application submitted successfully. Your Registration ID is ${agency.RegistrationID}. Please wait for admin approval.`,
      registrationID: agency.RegistrationID,
    });
  } catch (error) {
    console.error('Error in applyAgency:', error.stack);
    // Handle MongoDB duplicate key error as a fallback
    if (error.code === 11000 && error.keyPattern?.AgencyEmail) {
      return res.status(400).json({
        success: false,
        error: 'Agency email already exists. Please use a different email.',
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to apply for agency',
    });
  }
};

exports.getApplicationStatus = async (req, res) => {
  try {
    // Validate authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided or invalid token',
      });
    }

    const { registrationID } = req.params;

    // Validate registrationID
    if (!registrationID) {
      return res.status(400).json({
        success: false,
        error: 'RegistrationID is required in the URL',
      });
    }

    // Find agency by RegistrationID
    const agency = await AgencyModel.findOne({ RegistrationID: registrationID }).select(
      'AgencyName RegistrationID Approval_Status Applied_Date Approval_Date Approved_By UserID AgencyID AgencyAddress AgencyEmail AgencyMobileNo Gst_NO'
    );

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: 'Agency application not found',
      });
    }

    // Restrict access for 'User' role to their own applications
    if (req.user.Role === 'User' && agency.UserID.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only check the status of your own application',
      });
    }

    // Fetch applicant role
    const applicant = await User.findById(agency.UserID).select('Role');

    // Prepare response
    res.status(200).json({
      success: true,
      data: {
        _id: agency._id,
        UserID: agency.UserID,
        AgencyName: agency.AgencyName,
        AgencyEmail: agency.AgencyEmail,
        AgencyMobileNo: agency.AgencyMobileNo,
        Gst_NO: agency.Gst_NO,
        Approval_Status: agency.Approval_Status,
        Approval_Date: agency.Approval_Date,
        Applied_Date: agency.Applied_Date,
        RegistrationID: agency.RegistrationID,
        AgencyID: agency.AgencyID,
        AgencyAddress: agency.AgencyAddress,
        Applicant_Role: applicant ? applicant.Role : 'User',
        Approved_By: agency.Approved_By
          ? {
              _id: agency.Approved_By._id,
              username: agency.Approved_By.username,
              role: agency.Approved_By.role,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error in getApplicationStatus:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message,
    });
  }
};



exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user._id; // From authMiddleware

    // Fetch applications from AgencyModel
    const agencyApplications = await AgencyModel.find({ UserID: userId })
      .lean()
      .then(apps => apps.map(app => ({ ...app, type: 'agency' })));

    // Fetch applications from DeliveryStaffModel
    const deliveryStaffApplications = await DeliveryStaffModel.find({ UserID: userId })
      .lean()
      .then(apps => apps.map(app => ({ ...app, type: 'deliverystaff' })));

    // Fetch applications from CustomerModel
    const customerApplications = await Customer.find({ UserID: userId })
      .lean()
      .then(apps => apps.map(app => ({ ...app, type: 'customer' })));

    // Combine all applications
    const applications = [
      ...agencyApplications,
      ...deliveryStaffApplications,
      ...customerApplications,
    ];

    // Sort applications by applied date (if available) in descending order
    applications.sort((a, b) => {
      const dateA = a.Applied_Date ? new Date(a.Applied_Date) : new Date(0);
      const dateB = b.Applied_Date ? new Date(b.Applied_Date) : new Date(0);
      return dateB - dateA;
    });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
    });
  }
};
