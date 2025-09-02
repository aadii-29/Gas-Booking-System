const DeliveryStaff = require("../Models/DeliveryStaff");
const AgencyModel = require("../Models/AgencyModel");
const User = require("../Models/UserModel");
const fs = require('fs');
const path = require('path');

// Apply to become a delivery staff member
exports.applyDeliveryStaff = async (req, res) => {
  let deliveryStaff; // Declare outside try block for cleanup
  try {
    // Verify user exists and is authenticated
    if (!req.user || !req.user._id || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "User not authenticated or role not provided",
      });
    }

    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user role allows application (e.g., not already an Agency or Admin)
    const normalizedRole = req.user.role.toLowerCase();
    if (normalizedRole === "agency" || normalizedRole === "admin") {
      return res.status(403).json({
        success: false,
        message: `Unauthorized: ${req.user.role} cannot apply as delivery staff`,
      });
    }

    // Get application details from request body
    const {
      AgencyID,
      StaffName,
      DOB,
      StaffMobileNo,
      StaffEmail,
      StaffAddress,
      AadharNumber,
      Salary,
      AssignedArea,
    } = req.body;
    const files = req.files;

    // Validate required fields
    if (
      !AgencyID ||
      !StaffName ||
      !DOB ||
      !StaffMobileNo ||
      !StaffEmail ||
      !StaffAddress ||
      !AadharNumber ||
      !Salary
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Parse and validate StaffAddress
    let parsedAddress;
    try {
      parsedAddress = typeof StaffAddress === 'string' ? JSON.parse(StaffAddress) : StaffAddress;
      if (
        !parsedAddress.FlatNo ||
        !parsedAddress.Building_Society_Name ||
        !parsedAddress.Area ||
        !parsedAddress.City ||
        !parsedAddress.State ||
        !parsedAddress.Pincode
      ) {
        return res.status(400).json({
          success: false,
          message: "All StaffAddress fields (FlatNo, Building_Society_Name, Area, City, State, Pincode) are required",
        });
      }
      // Validate Pincode format
      if (!/^[0-9]{6}$/.test(parsedAddress.Pincode)) {
        return res.status(400).json({
          success: false,
          message: "Pincode must be a valid 6-digit number",
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Invalid StaffAddress format: ${error.message}`,
      });
    }

    // Validate regex fields
    if (!/^[0-9]{10}$/.test(StaffMobileNo)) {
      return res.status(400).json({
        success: false,
        message: "StaffMobileNo must be a valid 10-digit number",
      });
    }
    if (!/^\S+@\S+\.\S+$/.test(StaffEmail)) {
      return res.status(400).json({
        success: false,
        message: "StaffEmail must be a valid email address",
      });
    }
    if (!/^[0-9]{12}$/.test(AadharNumber)) {
      return res.status(400).json({
        success: false,
        message: "AadharNumber must be a valid 12-digit number",
      });
    }

    // Validate AgencyID
    const agency = await AgencyModel.findOne({ AgencyID });
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: `Agency with AgencyID ${AgencyID} not found`,
      });
    }

    // Check if user already applied or is a delivery staff
    const existingApplication = await DeliveryStaff.findOne({
      UserID: req.user._id,
      AgencyID,
    });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied or are a delivery staff for this agency",
      });
    }

    // Create delivery staff application
    deliveryStaff = new DeliveryStaff({
      UserID: req.user._id,
      AgencyID,
      StaffName,
      DOB: new Date(DOB),
      StaffMobileNo,
      StaffEmail,
      StaffAddress: parsedAddress,
      AadharNumber,
      Salary: Number(Salary),
      AssignedArea: AssignedArea ? JSON.parse(AssignedArea) : [],
      Approval_Status: 'Pending',
      Status: 'Active',
      Documents: {
        AadharDocument: 'temp',
        StaffPhoto: 'temp',
        StaffSignature: 'temp',
      },
    });

    // Save to generate ApplicationID
    await deliveryStaff.save();
    console.log('Generated ApplicationID:', deliveryStaff.ApplicationID); // Debug log

    // Create folder: Uploads/Employment/<ApplicationID>/
    const employmentFolder = path.join(__dirname, '..', 'Uploads', 'Employment', deliveryStaff.ApplicationID);
    if (!fs.existsSync(employmentFolder)) {
      fs.mkdirSync(employmentFolder, { recursive: true });
    }

    // Move files to the ApplicationID folder and rename with ApplicationID prefix
    const documentFields = {
      AadharDocument: files.AadharDocument[0],
      StaffPhoto: files.StaffPhoto[0],
      StaffSignature: files.StaffSignature[0],
    };

    for (const [field, file] of Object.entries(documentFields)) {
      const ext = path.extname(file.originalname).toLowerCase();
      const newFileName = `${deliveryStaff.ApplicationID}_${field}${ext}`;
      const newPath = path.join(employmentFolder, newFileName);
      fs.renameSync(file.path, newPath);
      deliveryStaff.Documents[field] = path.join('Uploads', 'Employment', deliveryStaff.ApplicationID, newFileName).replace(/\\/g, '/');
    }

    // Save updated document paths
    await deliveryStaff.save();

    return res.status(201).json({
      success: true,
      message: "Delivery staff application submitted successfully",
      deliveryStaff: {
        ApplicationID: deliveryStaff.ApplicationID,
        AgencyID: deliveryStaff.AgencyID,
        StaffName: deliveryStaff.StaffName,
        Approval_Status: deliveryStaff.Approval_Status,
        Documents: {
          AadharDocument: deliveryStaff.Documents.AadharDocument,
          StaffPhoto: deliveryStaff.Documents.StaffPhoto,
          StaffSignature: deliveryStaff.Documents.StaffSignature,
        },
      },
    });
  } catch (error) {
    // Clean up uploaded files and folder on error
    if (req.files) {
      Object.values(req.files).forEach((fileArray) =>
        fileArray.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        })
      );
    }
    if (deliveryStaff?.ApplicationID) {
      const employmentFolder = path.join(__dirname, '..', 'Uploads', 'Employment', deliveryStaff.ApplicationID);
      if (fs.existsSync(employmentFolder)) {
        fs.rmdirSync(employmentFolder, { recursive: true });
      }
    }
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

// View delivery staff application status
exports.viewApplicationStatusByID = async (req, res) => {
  try {
    // Verify user exists and is authenticated
    if (!req.user || !req.user._id || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "User not authenticated or role not provided",
      });
    }

    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get ApplicationID from request body
    const { ApplicationID } = req.body;

    // Validate ApplicationID
    if (!ApplicationID || typeof ApplicationID !== 'string' || ApplicationID.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "ApplicationID is required and must be a valid string",
      });
    }

    // Find the application
    const application = await DeliveryStaff.findOne({ ApplicationID });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application with ApplicationID ${ApplicationID} not found`,
      });
    }

    // Authorize access
    const normalizedRole = req.user.role.toLowerCase();
    const isApplicant = application.UserID.toString() === req.user._id.toString();
    let isAgency = false;

    if (normalizedRole === 'agency') {
      const agency = await AgencyModel.findOne({
        AgencyID: application.AgencyID,
        UserID: req.user._id,
      });
      isAgency = !!agency;
    }

    if (!isApplicant && !isAgency && normalizedRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to view this application",
      });
    }

    // Prepare response with all relevant application details
    const response = {
      success: true,
      message: "Application status retrieved successfully",
      application: {
        ApplicationID: application.ApplicationID,
        AgencyID: application.AgencyID,
        StaffName: application.StaffName,
        DOB: application.DOB.toISOString().split('T')[0], // Format as YYYY-MM-DD
        StaffMobileNo: application.StaffMobileNo,
        StaffEmail: application.StaffEmail,
        StaffAddress: application.StaffAddress,
        AadharNumber: application.AadharNumber,
        Salary: application.Salary,
        AssignedArea: application.AssignedArea,
        Approval_Status: application.Approval_Status,
        Status: application.Status,
        Documents: {
          AadharDocument: application.Documents.AadharDocument,
          StaffPhoto: application.Documents.StaffPhoto,
          StaffSignature: application.Documents.StaffSignature,
        },
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in viewApplicationStatus:', error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
// View all delivery staff applications
exports.viewApplicationStatus = async (req, res) => {
  try {
    // Verify user exists and is authenticated
    if (!req.user || !req.user._id || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "User not authenticated or role not provided",
      });
    }

    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const normalizedRole = req.user.role.toLowerCase();
    let applications = [];

    // Fetch applications based on role
    if (normalizedRole === 'user') {
      // Users can only see their own applications
      applications = await DeliveryStaff.find({ UserID: req.user._id });
    } else if (normalizedRole === 'agency') {
      // Agency can see applications for their agencies
      const agencies = await AgencyModel.find({ UserID: req.user._id });
      const agencyIDs = agencies.map(agency => agency.AgencyID);
      applications = await DeliveryStaff.find({ AgencyID: { $in: agencyIDs } });
    } else if (normalizedRole === 'admin') {
      // Admins can see all applications
      applications = await DeliveryStaff.find({});
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Invalid role",
      });
    }

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No delivery staff applications found",
      });
    }

    // Prepare response with all relevant application details
    const formattedApplications = applications.map(application => ({
      ApplicationID: application.ApplicationID,
      AgencyID: application.AgencyID,
      StaffName: application.StaffName,
      DOB: application.DOB.toISOString().split('T')[0], // Format as YYYY-MM-DD
      StaffMobileNo: application.StaffMobileNo,
      StaffEmail: application.StaffEmail,
      StaffAddress: application.StaffAddress,
      AadharNumber: application.AadharNumber,
      Salary: application.Salary,
      AssignedArea: application.AssignedArea,
      Approval_Status: application.Approval_Status,
      Status: application.Status,
      Documents: {
        AadharDocument: application.Documents.AadharDocument,
        StaffPhoto: application.Documents.StaffPhoto,
        StaffSignature: application.Documents.StaffSignature,
      },
    }));

    return res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      applications: formattedApplications,
    });
  } catch (error) {
    console.error('Error in viewAllDeliveryStaffApplications:', error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};