const AgencyModel = require("../Models/AgencyModel");
const CustomerModel = require("../Models/CustomerModel");
const User = require("../Models/UserModel");
const DeliveryStaff = require("../Models/DeliveryStaff");
const CustomerConnectionModel = require('../Models/CustomerConnectionModel');


const fs = require('fs');
;const Customer = require('../Models/CustomerModel');
//viewall pending  delivery staff  apllication
exports.pendingDeliveryStaffApplications = async (req, res) => {
  try {
    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get query parameters
    const { AgencyID, page = 1, limit = 5 } = req.query;
    const parsedPage = parseInt(page);
    let parsedLimit = parseInt(limit);

    // Validate page
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
    }

    // Validate limit (must be a multiple of 5)
    if (isNaN(parsedLimit) || parsedLimit < 5 || parsedLimit % 5 !== 0) {
      parsedLimit = 5; // Default to 5 if invalid
    }

    const skip = (parsedPage - 1) * parsedLimit;

    // Build query with mandatory Pending status
    const query = { Approval_Status: 'Pending' };
    const normalizedRole = req.user.role.toLowerCase();

    if (normalizedRole === 'agency') {
      // Agency: Restrict to their AgencyID
      if (!req.user.AgencyID) {
        return res.status(403).json({
          success: false,
          message: 'AgencyID not found in user profile',
        });
      }
      const agency = await AgencyModel.findOne({ AgencyID: req.user.AgencyID });
      if (!agency) {
        return res.status(404).json({
          success: false,
          message: `Agency with AgencyID ${req.user.AgencyID} not found`,
        });
      }
      query.AgencyID = req.user.AgencyID;
    } else if (normalizedRole === 'admin') {
      // Admin: Optionally filter by AgencyID
      if (AgencyID) {
        const agency = await AgencyModel.findOne({ AgencyID });
        if (!agency) {
          return res.status(404).json({
            success: false,
            message: `Agency with AgencyID ${AgencyID} not found`,
          });
        }
        query.AgencyID = AgencyID;
      }
      // No AgencyID filter means all agencies
    }

    // Fetch pending delivery staff applications with pagination
    const applications = await DeliveryStaff.find(query)
      .select(
        'ApplicationID UserID AgencyID StaffName StaffEmail StaffMobileNo StaffAddress AadharNumber DOB Salary AssignedArea Approval_Status Status CreatedAt UpdatedAt Documents'
      )
      .skip(skip)
      .limit(parsedLimit);

    // Get total count for pagination
    const totalCount = await DeliveryStaff.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: `Retrieved pending delivery staff applications${AgencyID ? ` for AgencyID ${AgencyID}` : ''}`,
      count: applications.length,
      totalCount,
      totalPages: Math.ceil(totalCount / parsedLimit),
      currentPage: parsedPage,
      limit: parsedLimit,
      applications: applications.map((app) => ({
        ApplicationID: app.ApplicationID,
        UserID: app.UserID,
        AgencyID: app.AgencyID,
        StaffName: app.StaffName,
        StaffEmail: app.StaffEmail,
        StaffMobileNo: app.StaffMobileNo,
        StaffAddress: app.StaffAddress,
        AadharNumber: app.AadharNumber,
        DOB: app.DOB,
        Salary: app.Salary,
        AssignedArea: app.AssignedArea,
        Approval_Status: app.Approval_Status,
        Status: app.Status,
        CreatedAt: app.CreatedAt,
        UpdatedAt: app.UpdatedAt,
        Documents: app.Documents,
      })),
    });
  } catch (error) {
    console.error('View pending delivery staff applications error:', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

exports.getDeliveryStaffapplicationById = async (req, res) => {
  try {
    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get staffId from URL parameters
    const { staffId } = req.params;
    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID is required',
      });
    }

    // Build query
    const query = { ApplicationID: staffId }; // Assuming ApplicationID is the unique identifier
    const normalizedRole = req.user.role.toLowerCase();

    if (normalizedRole === 'agency') {
      // Agency: Restrict to their AgencyID
      if (!req.user.AgencyID) {
        return res.status(403).json({
          success: false,
          message: 'AgencyID not found in user profile',
        });
      }
      const agency = await AgencyModel.findOne({ AgencyID: req.user.AgencyID });
      if (!agency) {
        return res.status(404).json({
          success: false,
          message: `Agency with AgencyID ${req.user.AgencyID} not found`,
        });
      }
      query.AgencyID = req.user.AgencyID;
    } else if (normalizedRole !== 'admin') {
      // Only agency and admin roles can access this endpoint
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }
    // Admin: No AgencyID restriction unless specified (optional AgencyID query param)
    const { AgencyID } = req.query;
    if (normalizedRole === 'admin' && AgencyID) {
      const agency = await AgencyModel.findOne({ AgencyID });
      if (!agency) {
        return res.status(404).json({
          success: false,
          message: `Agency with AgencyID ${AgencyID} not found`,
        });
      }
      query.AgencyID = AgencyID;
    }

    // Fetch the delivery staff application
    const application = await DeliveryStaff.findOne(query).select(
      'ApplicationID UserID AgencyID StaffName StaffEmail StaffMobileNo StaffAddress AadharNumber DOB Salary AssignedArea Approval_Status Status CreatedAt UpdatedAt Documents'
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Delivery staff application with ID ${staffId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Retrieved delivery staff application with ID ${staffId}`,
      application: {
        ApplicationID: application.ApplicationID,
        UserID: application.UserID,
        AgencyID: application.AgencyID,
        StaffName: application.StaffName,
        StaffEmail: application.StaffEmail,
        StaffMobileNo: application.StaffMobileNo,
        StaffAddress: application.StaffAddress,
        AadharNumber: application.AadharNumber,
        DOB: application.DOB,
        Salary: application.Salary,
        AssignedArea: application.AssignedArea,
        Approval_Status: application.Approval_Status,
        Status: application.Status,
        CreatedAt: application.CreatedAt,
        UpdatedAt: application.UpdatedAt,
        Documents: application.Documents,
      },
    });
  } catch (error) {
    console.error('Get delivery staff by ID error:', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
// View all delivery staff applications with optional status filter
exports.viewDeliveryStaffApplications = async (req, res) => {
  try {
    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get Approval_Status and AgencyID from request body (optional)
    const { Approval_Status, AgencyID } = req.body;

    // Validate Approval_Status if provided
    if (Approval_Status && !["Pending", "Approved", "Rejected"].includes(Approval_Status)) {
      return res.status(400).json({
        success: false,
        message: "Approval_Status must be 'Pending', 'Approved', or 'Rejected'",
      });
    }

    // Build query based on role
    const query = {};
    const normalizedRole = req.user.role.toLowerCase();

    if (normalizedRole === "agency") {
      // Agency: Restrict to their AgencyID
      if (!req.user.AgencyID) {
        return res.status(403).json({
          success: false,
          message: "AgencyID not found in user profile",
        });
      }
      const agency = await AgencyModel.findOne({ AgencyID: req.user.AgencyID });
      if (!agency) {
        return res.status(404).json({
          success: false,
          message: `Agency with AgencyID ${req.user.AgencyID} not found`,
        });
      }
      query.AgencyID = req.user.AgencyID;
    } else if (normalizedRole === "admin") {
      // Admin: Optionally filter by AgencyID
      if (AgencyID) {
        const agency = await AgencyModel.findOne({ AgencyID });
        if (!agency) {
          return res.status(404).json({
            success: false,
            message: `Agency with AgencyID ${AgencyID} not found`,
          });
        }
        query.AgencyID = AgencyID;
      }
      // No AgencyID filter means all agencies
    }

    // Add Approval_Status filter if provided
    if (Approval_Status) {
      query.Approval_Status = Approval_Status;
    }

    // Fetch delivery staff applications
    const applications = await DeliveryStaff.find(query).select(
      "ApplicationID EmployeeID AgencyID StaffName StaffEmail StaffMobileNo Approval_Status Status CreatedAt UpdatedAt"
    );

    return res.status(200).json({
      success: true,
      message: Approval_Status
        ? `Retrieved ${Approval_Status} delivery staff applications${AgencyID ? ` for AgencyID ${AgencyID}` : ""}`
        : `Retrieved all delivery staff applications${AgencyID ? ` for AgencyID ${AgencyID}` : ""}`,
      count: applications.length,
      applications: applications.map((app) => ({
        ApplicationID: app.ApplicationID,
        EmployeeID: app.EmployeeID || null,
        AgencyID: app.AgencyID,
        StaffName: app.StaffName,
        StaffEmail: app.StaffEmail,
        StaffMobileNo: app.StaffMobileNo,
        Approval_Status: app.Approval_Status,
        Status: app.Status,
        CreatedAt: app.CreatedAt,
        UpdatedAt: app.UpdatedAt,
      })),
    });
  } catch (error) {
    console.error("View delivery staff applications error:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
// Approve or reject delivery staff application
exports.updateDeliveryStaffStatus = async (req, res) => {
  try {
    // Verify user exists and is authenticated
    if (!req.user || !req.user._id || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "User not authenticated or role not provided",
      });
    }

    // Verify user exists in the database
    const user = await User.findById(req.user._id).select('_id Username Role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has a valid role
    if (!user.Role) {
      return res.status(400).json({
        success: false,
        message: "User role is missing in database",
      });
    }

    // Check if user has appropriate role
    const normalizedRole = user.Role.toLowerCase();
    if (!["agency", "admin"].includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized role: ${user.Role} not allowed`,
      });
    }

    // Get ApplicationID from URL parameters
    const { ApplicationID } = req.params;
    // Get Approval_Status and Comments from request body
    const { Approval_Status, Comments } = req.body;

    if (!ApplicationID || !Approval_Status) {
      return res.status(400).json({
        success: false,
        message: "ApplicationID and Approval_Status are required",
      });
    }

    // Validate Approval_Status
    if (!["Approved", "Rejected"].includes(Approval_Status)) {
      return res.status(400).json({
        success: false,
        message: "Approval_Status must be 'Approved' or 'Rejected'",
      });
    }

    // Validate Comments length if provided
    if (Comments && Comments.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comments must not exceed 500 characters",
      });
    }

    // Construct query based on role
    const query = { ApplicationID };
    if (normalizedRole === "agency") {
      if (!req.user.AgencyID) {
        return res.status(403).json({
          success: false,
          message: "AgencyID not found in user profile",
        });
      }
      const agency = await AgencyModel.findOne({ AgencyID: req.user.AgencyID });
      if (!agency) {
        return res.status(404).json({
          success: false,
          message: `Agency with AgencyID ${req.user.AgencyID} not found`,
        });
      }
      query.AgencyID = req.user.AgencyID;
    }

    // Find delivery staff application
    const deliveryStaff = await DeliveryStaff.findOne(query);
    if (!deliveryStaff) {
      return res.status(404).json({
        success: false,
        message: `Delivery staff application with ApplicationID ${ApplicationID} not found`,
      });
    }

    // Check if already processed
    if (deliveryStaff.Approval_Status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Application already ${deliveryStaff.Approval_Status}`,
      });
    }

    // Update status and additional fields
    deliveryStaff.Approval_Status = Approval_Status;
    deliveryStaff.Status = Approval_Status === "Approved" ? "Active" : "Inactive";
    deliveryStaff.Approval_Date = new Date();
    deliveryStaff.Approved_By = {
      _id: user._id,
      username: user.Username || '',
      role: user.Role || ''
    };
    if (Comments) {
      deliveryStaff.Comments = Comments;
    }

    // Save changes
    try {
      await deliveryStaff.save();
    } catch (saveError) {
      console.error('Error saving delivery staff:', {
        error: saveError.message,
        stack: saveError.stack,
        applicationId: ApplicationID,
      });
      return res.status(500).json({
        success: false,
        message: `Failed to save delivery staff status for ApplicationID: ${ApplicationID}`,
        details: saveError.message,
      });
    }

    // Log action
    const agency = await AgencyModel.findOne({ AgencyID: deliveryStaff.AgencyID });
    const agencyID = agency ? agency.AgencyID : deliveryStaff.AgencyID;
    console.log(`Delivery staff ${deliveryStaff.StaffName} (ApplicationID: ${ApplicationID}, EmployeeID: ${deliveryStaff.EmployeeID}, AgencyID: ${agencyID}) ${Approval_Status.toLowerCase()} by ${user.Role} ${user.Username}`);

    return res.status(200).json({
      success: true,
      message: `Delivery staff application ${Approval_Status} successfully`,
      deliveryStaff: {
        ApplicationID: deliveryStaff.ApplicationID,
        EmployeeID: deliveryStaff.EmployeeID,
        AgencyID: deliveryStaff.AgencyID,
        StaffName: deliveryStaff.StaffName,
        Approval_Status: deliveryStaff.Approval_Status,
        Status: deliveryStaff.Status,
        Comments: deliveryStaff.Comments,
        Approval_Date: deliveryStaff.Approval_Date,
        Approved_By: {
          _id: user._id,
          username: user.Username || '',
          role: user.Role || ''
        },
        createdAt: deliveryStaff.createdAt,
        updatedAt: deliveryStaff.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating delivery staff status:', {
      error: error.message,
      stack: error.stack,
      applicationId: req.params.ApplicationID,
    });
    return res.status(500).json({
      success: false,
      message: `Server error updating delivery staff status for ApplicationID: ${req.params.ApplicationID}`,
      details: error.message,
    });
  }
};
// Update customer details by CustomerID
exports.updateCustomerByCustomerID = async (req, res) => {
  try {
    // Verify user exists and is authenticated
    if (!req.user || !req.user._id || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User not authenticated or role not provided',
      });
    }

    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is an agency or admin
    const normalizedRole = req.user.role.toLowerCase();
    if (normalizedRole !== 'agency' && normalizedRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Unauthorized role: ${req.user.role} not allowed`,
      });
    }

    // Get CustomerID and update fields from request body
    const { CustomerID, updates } = req.body;
    if (!CustomerID) {
      return res.status(400).json({
        success: false,
        message: 'CustomerID is required in request body',
      });
    }
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required in request body',
      });
    }

    // Define allowed fields for update
    const allowedFields = [
      'CustomerName',
      'CustomerMobileNo',
      'CustomerEmail',
      'Connection_Mode',
      'CustomerAddress',
      'AadharNumber',
      'AddressProof',
      'Bank',
      'Alloted_Cylinder',
      'Pending_Payment',
      'Approval_Status',
      'Approval_Date',
      'State_Of_Approve'
    ];

    // Validate update fields
    const updateKeys = Object.keys(updates);
    const invalidFields = updateKeys.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(', ')}`,
      });
    }

    // Prepare query based on role
    const query = { CustomerID };
    if (normalizedRole === 'agency') {
      // Agency can only update their own customers
      if (!req.user.AgencyID) {
        return res.status(403).json({
          success: false,
          message: 'AgencyID not found in user profile',
        });
      }
      query.AgencyID = req.user.AgencyID;
    }

    // Find and update customer
    const customer = await CustomerModel.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with CustomerID ${CustomerID} not found${normalizedRole === 'agency' ? ` for AgencyID ${req.user.AgencyID}` : ''}`,
      });
    }

    // Calculate cost breakdown if Pending_Payment was updated
    let customerWithBreakdown = customer._doc;
    if (updateKeys.includes('Pending_Payment')) {
      try {
        const { breakdown } = await calculatePendingPayment(
          customer.Connection_Mode,
          customer.Alloted_Cylinder,
          customer.AgencyID
        );
        customerWithBreakdown = {
          ...customer._doc,
          costBreakdown: breakdown,
        };
      } catch (error) {
        customerWithBreakdown = {
          ...customer._doc,
          costBreakdown: null,
          breakdownError: error.message,
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: `Customer with CustomerID ${CustomerID} updated successfully`,
      customer: customerWithBreakdown,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

// Delete customer by CustomerID
exports.deleteCustomerByCustomerID = async (req, res) => {
  try {
    // Verify user exists and is authenticated
    if (!req.user || !req.user._id || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User not authenticated or role not provided',
      });
    }

    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is an agency or admin
    const normalizedRole = req.user.role.toLowerCase();
    if (normalizedRole !== 'agency' && normalizedRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Unauthorized role: ${req.user.role} not allowed`,
      });
    }

    // Get CustomerID from request body
    const { CustomerID } = req.body;
    if (!CustomerID) {
      return res.status(400).json({
        success: false,
        message: 'CustomerID is required in request body',
      });
    }

    // Prepare query based on role
    const query = { CustomerID };
    if (normalizedRole === 'agency') {
      // Agency can only delete their own customers
      if (!req.user.AgencyID) {
        return res.status(403).json({
          success: false,
          message: 'AgencyID not found in user profile',
        });
      }
      query.AgencyID = req.user.AgencyID;
    }

    // Find and delete customer
    const customer = await CustomerModel.findOneAndDelete(query);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with CustomerID ${CustomerID} not found${normalizedRole === 'agency' ? ` for AgencyID ${req.user.AgencyID}` : ''}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Customer with CustomerID ${CustomerID} deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
// Get specific customer details by CustomerID with field selection
exports.viewCustomerByCustomerID = async (req, res) => {
  try {
    // Verify user exists and is authenticated
    if (!req.user || !req.user._id || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User not authenticated or role not provided',
      });
    }

    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is an agency
    const normalizedRole = req.user.role.toLowerCase();
    if (normalizedRole !== 'agency') {
      return res.status(403).json({
        success: false,
        message: `Unauthorized role: ${req.user.role} not allowed`,
      });
    }

    // Get CustomerID and fields from request body
    const { CustomerID, fields } = req.body;
    if (!CustomerID) {
      return res.status(400).json({
        success: false,
        message: 'CustomerID is required in request body',
      });
    }

    // Verify agency exists (based on user's AgencyID)
    const agency = await AgencyModel.findOne({ AgencyID: req.user.AgencyID });
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: `Agency with AgencyID ${req.user.AgencyID} not found`,
      });
    }

    // Field selection: Default to all fields if not provided or empty
    const allowedFields = [
      'RegistrationID',
      'CustomerID',
      'CustomerName',
      'CustomerMobileNo',
      'CustomerEmail',
      'Connection_Mode',
      'CustomerAddress',
      'AadharNumber',
      'AddressProof',
      'Bank',
      'Alloted_Cylinder',
      'Pending_Payment',
      'CreatedAt',
      'AgencyID',
      'Approval_Status',
      'Approval_Date',
      'State_Of_Approve'
    ];
    const selectedFields = fields && Array.isArray(fields) && fields.length > 0 ? fields : allowedFields;

    // Validate fields to prevent injection
    const invalidFields = selectedFields.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(', ')}`,
      });
    }

    // Fetch customer by CustomerID
    const customer = await CustomerModel.findOne({
      CustomerID,
      AgencyID: req.user.AgencyID, // Restrict to the user's agency
    }).select(selectedFields.join(' '));

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with CustomerID ${CustomerID} not found for AgencyID ${req.user.AgencyID}`,
      });
    }

    // Calculate cost breakdown if Pending_Payment is selected
    let customerWithBreakdown = customer._doc;
    if (selectedFields.includes('Pending_Payment')) {
      try {
        const { breakdown } = await calculatePendingPayment(
          customer.Connection_Mode,
          customer.Alloted_Cylinder,
          customer.AgencyID
        );
        customerWithBreakdown = {
          ...customer._doc,
          costBreakdown: breakdown,
        };
      } catch (error) {
        customerWithBreakdown = {
          ...customer._doc,
          costBreakdown: null,
          breakdownError: error.message,
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: `Customer with CustomerID ${CustomerID} retrieved successfully`,
      customer: customerWithBreakdown,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

// Get all customers with CustomerID for a specified AgencyID with pagination and field selection
exports.viewCustomersByAgencyID = async (req, res) => {
  try {
    // Verify user exists and is authenticated
    if (!req.user || !req.user._id || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User not authenticated or role not provided',
      });
    }

    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is an agency
    const normalizedRole = req.user.role.toLowerCase();
    if (normalizedRole !== 'agency') {
      return res.status(403).json({
        success: false,
        message: `Unauthorized role: ${req.user.role} not allowed`,
      });
    }

    // Get AgencyID, page, limit, and fields from request body
    const { AgencyID, page = 1, limit = 5, fields } = req.body;
    if (!AgencyID) {
      return res.status(400).json({
        success: false,
        message: 'AgencyID is required in request body',
      });
    }

    // Validate page and limit
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a positive integer',
      });
    }

    // Verify agency exists
    const agency = await AgencyModel.findOne({ AgencyID });
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: `Agency with AgencyID ${AgencyID} not found`,
      });
    }

    // Optional: Restrict agency to view only their own customers
    if (req.user.AgencyID && req.user.AgencyID !== AgencyID) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view customers of your own agency',
      });
    }

    // Pagination parameters
    const skip = (parsedPage - 1) * parsedLimit;

    // Field selection: Default to all fields if not provided or empty
    const allowedFields = [
      'RegistrationID',
      'CustomerID',
      'CustomerName',
      'CustomerMobileNo',
      'CustomerEmail',
      'Connection_Mode',
      'CustomerAddress',
      'AadharNumber',
      'AddressProof',
      'Bank',
      'Alloted_Cylinder',
      'Pending_Payment',
      'CreatedAt',
      'AgencyID',
      'Approval_Status',
      'Approval_Date',
      'State_Of_Approve'
    ];
    const selectedFields = fields && Array.isArray(fields) && fields.length > 0 ? fields : allowedFields;

    // Validate fields to prevent injection
    const invalidFields = selectedFields.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(', ')}`,
      });
    }

    // Fetch total count for pagination metadata
    const totalCustomers = await CustomerModel.countDocuments({
      AgencyID,
      CustomerID: { $exists: true, $ne: null },
    });

    // Fetch customers with pagination and field selection
    const customers = await CustomerModel.find({
      AgencyID,
      CustomerID: { $exists: true, $ne: null }, // Ensure CustomerID exists and is not null
    })
      .select(selectedFields.join(' '))
      .skip(skip)
      .limit(parsedLimit)
      .sort({ CreatedAt: -1 }); // Sort by newest first

    // Calculate cost breakdown for each customer if Pending_Payment is selected
    const customersWithBreakdown = await Promise.all(
      customers.map(async (customer) => {
        if (!selectedFields.includes('Pending_Payment')) {
          return customer._doc;
        }
        try {
          const { breakdown } = await calculatePendingPayment(
            customer.Connection_Mode,
            customer.Alloted_Cylinder,
            customer.AgencyID
          );
          return {
            ...customer._doc,
            costBreakdown: breakdown,
          };
        } catch (error) {
          return {
            ...customer._doc,
            costBreakdown: null,
            breakdownError: error.message,
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      message: `Customers with CustomerID for AgencyID ${AgencyID} retrieved successfully`,
      pagination: {
        totalCustomers,
        currentPage: parsedPage,
        totalPages: Math.ceil(totalCustomers / parsedLimit),
        customersPerPage: parsedLimit,
      },
      count: customersWithBreakdown.length,
      customers: customersWithBreakdown,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

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
      CustomerID: 'TEMP',
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

exports.getPendingNewCustomer = async (req, res) => {
  try {
    // Verify user authentication and role
    if (!req.user || !req.user._id || !req.user.role) {
      console.warn('getPendingNewCustomer: User or role not found', { user: req.user });
      return res.status(403).json({
        success: false,
        message: 'User not authenticated or role not provided',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      console.warn('getPendingNewCustomer: User not found in database', { userId: req.user._id });
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get query parameters
    const { AgencyID, page = 1, limit = 5 } = req.query;
    const parsedPage = parseInt(page);
    let parsedLimit = parseInt(limit);

    // Validate page
    if (isNaN(parsedPage) || parsedPage < 1) {
      console.warn('getPendingNewCustomer: Invalid page number', { page });
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
    }

    // Validate limit (must be 5, 10, or 15 to align with frontend)
    const limitOptions = [5, 10, 15];
    if (!limitOptions.includes(parsedLimit)) {
      console.warn('getPendingNewCustomer: Invalid limit, defaulting to 5', { limit });
      parsedLimit = 5; // Default to 5 if invalid
    }

    const skip = (parsedPage - 1) * parsedLimit;

    // Build query with mandatory Pending status
    const query = { Approval_Status: { $in: ['Pending', null] } };
    const normalizedRole = req.user.role.toLowerCase();
    const baseUrl = process.env.BASE_URL || '5001';

    if (normalizedRole === 'agency') {
      // Agency: Restrict to their AgencyID
      if (!req.user.AgencyID) {
        console.warn('getPendingNewCustomer: AgencyID not found for agency user', { userId: req.user._id });
        return res.status(403).json({
          success: false,
          message: 'AgencyID not found in user profile',
        });
      }
      const agency = await AgencyModel.findOne({ AgencyID: req.user.AgencyID });
      if (!agency) {
        console.warn('getPendingNewCustomer: Agency not found', { AgencyID: req.user.AgencyID });
        return res.status(404).json({
          success: false,
          message: `Agency with AgencyID ${req.user.AgencyID} not found`,
        });
      }
      query.AgencyID = req.user.AgencyID;
    } else if (normalizedRole === 'admin') {
      // Admin: Optionally filter by AgencyID
      if (AgencyID) {
        const agency = await AgencyModel.findOne({ AgencyID });
        if (!agency) {
          console.warn('getPendingNewCustomer: Agency not found for admin filter', { AgencyID });
          return res.status(404).json({
            success: false,
            message: `Agency with AgencyID ${AgencyID} not found`,
          });
        }
        query.AgencyID = AgencyID;
      }
      // No AgencyID filter means all agencies
    } else {
      console.warn('getPendingNewCustomer: Unauthorized role', { role: req.user.role });
      return res.status(403).json({
        success: false,
        message: `Unauthorized role: ${req.user.role} not allowed`,
      });
    }

    // Count total documents for pagination
    const totalCount = await CustomerModel.countDocuments(query);

    // Fetch pending customer applications
    const customers = await CustomerModel.find(query)
      .select(
        'RegistrationID CustomerName CustomerMobileNo CustomerEmailId Connection_Mode ' +
        'CustomerAddress AadharNumber AddressProof Bank Alloted_Cylinder Pending_Payment ' +
        'Applied_Date CreatedAt AgencyID CustomerSign AadharDocument AddressProofDocument ' +
        'BankDocument ProfilePic SignatureDocument'
      )
      .skip(skip)
      .limit(parsedLimit);

    const customersWithBreakdown = await Promise.all(
      customers.map(async (customer) => {
        try {
          const cleanedAddress = {
            FlatNo: customer.CustomerAddress.FlatNo || '',
            Building_Society_Name: customer.CustomerAddress.Building_Society_Name || '',
            Area: customer.CustomerAddress.Area || '',
            City: customer.CustomerAddress.City || '',
            State: customer.CustomerAddress.State || '',
            Pincode: customer.CustomerAddress.Pincode ? String(customer.CustomerAddress.Pincode) : '',
          };

          const { totalCost, breakdown } = await calculatePendingPayment(
            customer.Connection_Mode,
            customer.Alloted_Cylinder,
            customer.AgencyID
          );

          const formattedAddress = [
            cleanedAddress.FlatNo,
            cleanedAddress.Building_Society_Name,
            cleanedAddress.Area,
            cleanedAddress.City,
            cleanedAddress.State,
            cleanedAddress.Pincode,
          ]
            .filter(Boolean)
            .join(', ');

          const documentUrls = {
            aadharDocument:
              customer.AadharDocument && !customer.AadharDocument.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.AadharDocument}`
                : null,
            addressProofDocument:
              customer.AddressProofDocument && !customer.AddressProofDocument.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.AddressProofDocument}`
                : null,
            bankDocument:
              customer.BankDocument && !customer.BankDocument.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.BankDocument}`
                : null,
            profilePic:
              customer.ProfilePic && !customer.ProfilePic.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.ProfilePic}`
                : null,
            signatureDocument:
              customer.SignatureDocument && !customer.SignatureDocument.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.SignatureDocument}`
                : null,
          };

          return {
            id: customer.RegistrationID,
            name: customer.CustomerName,
            phone: customer.CustomerMobileNo,
            address: formattedAddress,
            status: customer.Approval_Status || 'Pending',
            email: customer.CustomerEmailId,
            connectionMode: customer.Connection_Mode,
            aadharNumber: customer.AadharNumber,
            addressProof: customer.AddressProof,
            bank: customer.Bank,
            allotedCylinder: customer.Alloted_Cylinder,
            pendingPayment: totalCost,
            costBreakdown: breakdown,
            breakdownError: null,
            agencyId: customer.AgencyID,
            createdAt: customer.CreatedAt,
            appliedDate: customer.Applied_Date,
            customerSign: customer.CustomerSign,
            documents: documentUrls,
          };
        } catch (error) {
          console.warn(
            `getPendingNewCustomer: Failed to calculate breakdown for customer ${customer.RegistrationID}: ${error.message}`
          );
          const cleanedAddress = {
            FlatNo: customer.CustomerAddress.FlatNo || '',
            Building_Society_Name: customer.CustomerAddress.Building_Society_Name || '',
            Area: customer.CustomerAddress.Area || '',
            City: customer.CustomerAddress.City || '',
            State: customer.CustomerAddress.State || '',
            Pincode: customer.CustomerAddress.Pincode ? String(customer.CustomerAddress.Pincode) : '',
          };

          const formattedAddress = [
            cleanedAddress.FlatNo,
            cleanedAddress.Building_Society_Name,
            cleanedAddress.Area,
            cleanedAddress.City,
            cleanedAddress.State,
            cleanedAddress.Pincode,
          ]
            .filter(Boolean)
            .join(', ');

          const documentUrls = {
            aadharDocument:
              customer.AadharDocument && !customer.AadharDocument.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.AadharDocument}`
                : null,
            addressProofDocument:
              customer.AddressProofDocument && !customer.AddressProofDocument.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.AddressProofDocument}`
                : null,
            bankDocument:
              customer.BankDocument && !customer.BankDocument.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.BankDocument}`
                : null,
            profilePic:
              customer.ProfilePic && !customer.ProfilePic.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.ProfilePic}`
                : null,
            signatureDocument:
              customer.SignatureDocument && !customer.SignatureDocument.startsWith('temp-')
                ? `http://localhost:${baseUrl}/Uploads/${customer.RegistrationID}/${customer.SignatureDocument}`
                : null,
          };

          return {
            id: customer.RegistrationID,
            name: customer.CustomerName,
            phone: customer.CustomerMobileNo,
            address: formattedAddress,
            status: customer.Approval_Status || 'Pending',
            email: customer.CustomerEmailId,
            connectionMode: customer.Connection_Mode,
            aadharNumber: customer.AadharNumber,
            addressProof: customer.AddressProof,
            bank: customer.Bank,
            allotedCylinder: customer.Alloted_Cylinder,
            pendingPayment: null,
            costBreakdown: null,
            breakdownError: error.message,
            agencyId: customer.AgencyID,
            createdAt: customer.CreatedAt,
            appliedDate: customer.Applied_Date,
            customerSign: customer.CustomerSign,
            documents: documentUrls,
          };
        }
      })
    );

    const totalPages = Math.ceil(totalCount / parsedLimit);

    return res.status(200).json({
      success: true,
      message: `Retrieved pending customer applications${AgencyID ? ` for AgencyID ${AgencyID}` : ''}`,
      count: customersWithBreakdown.length,
      totalCount,
      currentPage: parsedPage,
      totalPages,
      limit: parsedLimit,
      customers: customersWithBreakdown,
    });
  } catch (error) {
    console.error('getPendingNewCustomer: Error retrieving pending customers:', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided or invalid token',
      });
    }

    const { reqID } = req.params;
    const { status, comments } = req.body;

    // Validate inputs
    if (!reqID) {
      return res.status(400).json({
        success: false,
        message: 'RegistrationID is required',
      });
    }
    if (!['Approved', 'Denied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Denied',
      });
    }
    if (comments && comments.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comments must not exceed 500 characters',
      });
    }

    const customer = await CustomerModel.findOne({ RegistrationID: reqID });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found for RegistrationID: ${reqID}`,
      });
    }

    if (customer.Approval_Status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Customer is already ${customer.Approval_Status} for RegistrationID: ${reqID}`,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !['Admin', 'Agency'].includes(user.Role)) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized: User ${user?.Username || 'unknown'} does not have Admin or Agency role`,
      });
    }

    // Verify AgencyID if user is Agency
    if (user.Role === 'Agency') {
      const agency = await AgencyModel.findOne({ UserID: user._id });
      if (!agency || agency.AgencyID !== customer.AgencyID) {
        return res.status(403).json({
          success: false,
          message: `Unauthorized: AgencyID ${agency?.AgencyID || 'unknown'} does not match customer AgencyID ${customer.AgencyID}`,
        });
      }
    }

    // Update customer status
    customer.Approval_Status = status;
    customer.Approved_By = {
      _id: user._id,
      username: user.Username,
      role: user.Role,
    };

    if (status === 'Approved') {
      customer.Approval_Date = new Date();
      customer.State_Of_Approve = 'Approved';
    } else if (status === 'Denied') {
      customer.State_Of_Approve = 'Denied';
    }

    if (comments) {
      customer.Comments = comments;
    }

    try {
      await customer.save(); // Triggers CustomerSchema.pre('save') for CustomerID
    } catch (saveError) {
      console.error('Error saving customer:', {
        error: saveError.message,
        stack: saveError.stack,
        registrationId: reqID,
      });
      return res.status(500).json({
        success: false,
        message: `Failed to save customer status for RegistrationID: ${reqID}`,
        details: saveError.message,
      });
    }

    // Find agency for logging
    const agency = await AgencyModel.findOne({ UserID: user._id });
    const agencyID = agency ? agency.AgencyID : customer.AgencyID;

    console.log(`Customer ${customer.CustomerName} (RegistrationID: ${reqID}, CustomerID: ${customer.CustomerID}, AgencyID: ${agencyID}) ${status.toLowerCase()} by ${user.Role} ${user.Username}`);

    res.status(200).json({
      success: true,
      message: `Customer ${status.toLowerCase()} successfully${agencyID && status === 'Approved' ? ` (Assigned AgencyID: ${agencyID})` : ''}`,
      data: {
        CustomerName: customer.CustomerName,
        Approval_Status: customer.Approval_Status,
        Approval_Date: customer.Approval_Date,
        Applied_Date: customer.CreatedAt,
        RegistrationID: customer.RegistrationID,
        CustomerID: customer.CustomerID || null,
        Approved_By: customer.Approved_By,
        AgencyID: customer.AgencyID,
      },
    });
  } catch (error) {
    console.error('Error updating Customer status:', {
      error: error.message,
      stack: error.stack,
      registrationId: req.params.reqID,
    });
    res.status(500).json({
      success: false,
      message: `Server error updating customer status for RegistrationID: ${req.params.reqID}`,
      details: error.message,
    });
  }
};

exports.updateAgencyStatus = async (req, res) => {
  try {
    const { registrationID, status, approvedBy } = req.body;

    const agency = await Agency.findOne({ RegistrationID: registrationID });
    if (!agency) {
      return res
        .status(404)
        .json({ success: false, message: "Agency not found" });
    }

    agency.Approval_Status = status;
    agency.Approved_By = approvedBy;

    if (status === "Approved") {
      await agency.save();
      // Update user's Role and LinkedID
      await User.findOneAndUpdate(
        { _id: agency.UserID },
        { Role: "Agency", LinkedID: agency.AgencyID },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: `Congratulations! Your agency application has been approved. Your Agency ID is ${agency.AgencyID}. You now have full access to agency features.`,
        agencyID: agency.AgencyID,
      });
    } else if (status === "Denied") {
      await agency.save();
      return res.status(200).json({
        success: true,
        message: "Agency application has been denied.",
      });
    }
  } catch (error) {
    if (error.message.includes("Unable to generate unique AgencyID")) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate unique AgencyID. Please try again later.",
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAgencyDetails = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided or invalid token",
      });
    }

    const { agencyID } = req.params;

    if (!agencyID) {
      return res.status(400).json({
        success: false,
        error: "AgencyID is required",
      });
    }

    const agency = await AgencyModel.findOne({ AgencyID: agencyID });
    if (!agency) {
      return res.status(404).json({
        success: false,
        error: `Agency with AgencyID ${agencyID} not found`,
      });
    }

    if (agency.UserID.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: You can only access your own agency details",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        AgencyID: agency.AgencyID,
        AgencyName: agency.AgencyName,
        AgencyAddress: agency.AgencyAddress,
        Approval_Status: agency.Approval_Status,
        Approval_Date: agency.Approval_Date,
        Applied_Date: agency.Applied_Date,
        RegistrationID: agency.RegistrationID,
      },
    });
  } catch (error) {
    console.error("Error in getAgencyDetails:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message,
    });
  }
};
