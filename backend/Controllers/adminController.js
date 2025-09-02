const mongoose = require('mongoose');
const AdminModel = require('../Models/AdminModel');
const AgencyModel = require('../Models/AgencyModel');
const User = mongoose.model('User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // Added import
const DeliveryStaff = mongoose.model('DeliveryStaff');
const Customer = require('../Models/CustomerModel');
exports.updateAgencyStatus = async (req, res) => {
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
    if (!reqID || !['Approved', 'Denied'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid RegistrationID or status (Approved/Denied) required',
      });
    }

    if (comments && comments.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Comments must not exceed 500 characters',
      });
    }

    const agency = await AgencyModel.findOne({ RegistrationID: reqID });
    if (!agency) {
      return res.status(404).json({
        success: false,
        error: 'Agency not found',
      });
    }

    if (agency.Approval_Status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: `Agency is already ${agency.Approval_Status}`,
      });
    }

    if (status === 'Approved' && (!agency.AgencyAddress || !agency.AgencyAddress.State || !agency.AgencyAddress.City)) {
      return res.status(400).json({
        success: false,
        error: 'AgencyAddress is incomplete and required for approval',
      });
    }

    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.Role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only Admins can approve/deny agencies',
      });
    }

    agency.Approval_Status = status;
    agency.Approved_By = {
      _id: adminUser._id,
      username: adminUser.Username,
      role: adminUser.Role,
    };

    if (status === 'Approved') {
      agency.Approval_Date = new Date();
    }

    await agency.save();

    await new AdminModel({
      adminID: req.user._id,
      action: `Agency ${status.toLowerCase()}`,
      targetID: agency._id,
      targetModel: 'Agency',
      details: `Agency ${agency.AgencyName} (RegistrationID: ${reqID}${agency.AgencyID ? `, AgencyID: ${agency.AgencyID}` : ''}) was ${status.toLowerCase()} by admin ${adminUser.Username}`,
      comments: comments || null,
    }).save();

    res.status(200).json({
      success: true,
      message: `Agency ${status.toLowerCase()} successfully${agency.AgencyID && status === 'Approved' ? ` (Assigned AgencyID: ${agency.AgencyID})` : ''}`,
      data: {
        AgencyName: agency.AgencyName,
        Approval_Status: agency.Approval_Status,
        Approval_Date: agency.Approval_Date,
        Applied_Date: agency.Applied_Date,
        RegistrationID: agency.RegistrationID,
        AgencyID: agency.AgencyID,
        Approved_By: agency.Approved_By,
      },
    });
  } catch (error) {
    console.error('Error updating agency status:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message,
    });
  }
};
exports.updateAgency = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided or invalid token',
      });
    }

    const { agencyID } = req.params;
    const { AgencyName, AgencyAddress, comments, resetPassword } = req.body;

    if (!agencyID) {
      return res.status(400).json({
        success: false,
        error: 'AgencyID is required',
      });
    }

    const agency = await AgencyModel.findOne({ AgencyID: agencyID });
    if (!agency) {
      return res.status(404).json({
        success: false,
        error: `Agency with AgencyID ${agencyID} not found`,
      });
    }

    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.Role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only Admins can update agencies',
      });
    }

    let changePasswordUrl = null;
    if (resetPassword) {
      const user = await User.findById(agency.UserID);
      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Associated user not found',
        });
      }

      const temporaryPassword = crypto.randomBytes(8).toString('hex');
      user.Password = await bcrypt.hash(temporaryPassword, 10);
      user.isTemporaryPassword = true;
      user.loginCount = 0;
      user.changePasswordToken = undefined;
      user.changePasswordExpires = undefined;

      const changePasswordToken = crypto.randomBytes(32).toString('hex');
      const changePasswordTokenHash = crypto.createHash('sha256').update(changePasswordToken).digest('hex');

      user.changePasswordToken = changePasswordTokenHash;
      user.changePasswordExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();

      changePasswordUrl = `${process.env.FRONTEND_URL}/api/auth/change-password/${changePasswordToken}`;
      agency.changePasswordUrl = changePasswordUrl;
    }

    if (AgencyName) agency.AgencyName = AgencyName;
    if (AgencyAddress) {
      if (!AgencyAddress.State || !AgencyAddress.City) {
        return res.status(400).json({
          success: false,
          error: 'AgencyAddress must include State and City',
        });
      }
      agency.AgencyAddress = AgencyAddress;
    }

    await agency.save();

    await new AdminModel({
      adminID: req.user._id,
      action: resetPassword ? 'Password reset approved' : 'Agency updated',
      targetID: agency._id,
      targetModel: 'Agency',
      details: `Agency ${agency.AgencyName} (AgencyID: ${agencyID}) ${resetPassword ? 'password reset' : 'updated'} by admin ${adminUser.Username}`,
      comments: comments || null,
    }).save();

    res.status(200).json({
      success: true,
      message: resetPassword
        ? `Password reset for AgencyID ${agencyID} approved successfully`
        : `Agency with AgencyID ${agencyID} updated successfully`,
      data: {
        AgencyID: agency.AgencyID,
        AgencyName: agency.AgencyName,
        AgencyAddress: agency.AgencyAddress,
        Approval_Status: agency.Approval_Status,
        Approval_Date: agency.Approval_Date,
        Applied_Date: agency.Applied_Date,
        RegistrationID: agency.RegistrationID,
        Approved_By: agency.Approved_By,
        changePasswordUrl,
      },
    });
  } catch (error) {
    console.error('Error updating agency:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message,
    });
  }
};
exports.getPendingAgencies = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided or invalid token',
      });
    }

    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.Role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only Admins can view pending agencies',
      });
    }

    const pendingAgencies = await AgencyModel.find({ Approval_Status: 'Pending' })
      .populate('UserID', 'Username EmailId MobileNumber Role')
      .exec();

    await new AdminModel({
      adminID: req.user._id,
      action: 'View pending agencies',
      targetModel: 'Agency',
      details: `Admin ${adminUser.Username} viewed ${pendingAgencies.length} pending agency requests`,
    }).save();

    res.status(200).json({
      success: true,
      message: pendingAgencies.length ? 'Pending agencies retrieved successfully' : 'No pending agency requests found',
      data: pendingAgencies,
    });
  } catch (error) {
    console.error('Error fetching pending agencies:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message,
    });
  }
};
exports.deleteAgency = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided or invalid token',
      });
    }

    const { agencyID } = req.params;
    const { comments } = req.body;

    if (!agencyID) {
      return res.status(400).json({
        success: false,
        error: 'AgencyID is required',
      });
    }

    if (comments && comments.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Comments must not exceed 500 characters',
      });
    }

    const agency = await AgencyModel.findOne({ AgencyID: agencyID }).session(session);
    if (!agency) {
      return res.status(404).json({
        success: false,
        error: `Agency with AgencyID ${agencyID} not found`,
      });
    }

    const adminUser = await User.findById(req.user._id).session(session);
    if (!adminUser || adminUser.Role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only Admins can delete agencies',
      });
    }

    const user = await User.findById(agency.UserID).session(session);
    if (user) {
      user.Role = 'User';
      user.isTemporaryPassword = false;
      user.changePasswordToken = undefined;
      user.changePasswordExpires = undefined;
      user.loginCount = 0;
      await user.save({ session });
    }

    await AgencyModel.deleteOne({ AgencyID: agencyID }, { session });

    await new AdminModel({
      adminID: req.user._id,
      action: 'Agency deleted',
      targetID: agency._id,
      targetModel: 'Agency',
      details: `Agency ${agency.AgencyName} (AgencyID: ${agencyID}) deleted by admin ${adminUser.Username}`,
      comments: comments || null,
    }).save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Agency with AgencyID ${agencyID} deleted successfully`,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting agency:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.getAllAgencies = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided or invalid token',
      });
    }

    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.Role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only Admins can view agencies',
      });
    }

    const agencies = await AgencyModel.find()
      .select('AgencyID AgencyName Approval_Status Approval_Date Applied_Date RegistrationID Approved_By AgencyAddress UserID')
      .populate('UserID', 'Role Username EmailId')
      .exec();

    const agencyData = agencies.map(agency => ({
      AgencyID: agency.AgencyID,
      AgencyName: agency.AgencyName,
      Approval_Status: agency.Approval_Status,
      Approval_Date: agency.Approval_Date,
      Applied_Date: agency.Applied_Date,
      RegistrationID: agency.RegistrationID,
      AgencyAddress: agency.AgencyAddress,
      Approved_By: agency.Approved_By,
      Applicant_Role: agency.UserID ? agency.UserID.Role : 'User',
      Applicant_Username: agency.UserID ? agency.UserID.Username : null,
      Applicant_EmailId: agency.UserID ? agency.UserID.EmailId : null,
    }));

    await new AdminModel({
      adminID: req.user._id,
      action: 'View all agencies',
      targetModel: 'Agency',
      details: `Admin ${adminUser.Username} viewed ${agencies.length} agency details`,
    }).save();

    res.status(200).json({
      success: true,
      message: agencies.length ? 'Agencies retrieved successfully' : 'No agencies found',
      data: agencyData,
    });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message,
    });
  }
};
exports.getAgencyById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided or invalid token',
      });
    }

    const { agencyID } = req.params;

    if (!agencyID) {
      return res.status(400).json({
        success: false,
        error: 'AgencyID is required',
      });
    }

    const adminUser = await User.findById(req.user._id);
    if (!adminUser || adminUser.Role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only Admins can view agency details',
      });
    }

    const agency = await AgencyModel.findOne({ AgencyID: agencyID })
      .select('AgencyID AgencyName Approval_Status Approval_Date Applied_Date RegistrationID Approved_By AgencyAddress UserID')
      .populate('UserID', 'Role Username EmailId')
      .exec();

    if (!agency) {
      return res.status(404).json({
        success: false,
        error: `Agency with AgencyID ${agencyID} not found`,
      });
    }

    const agencyData = {
      AgencyID: agency.AgencyID,
      AgencyName: agency.AgencyName,
      Approval_Status: agency.Approval_Status,
      Approval_Date: agency.Approval_Date,
      Applied_Date: agency.Applied_Date,
      RegistrationID: agency.RegistrationID,
      AgencyAddress: agency.AgencyAddress,
      Approved_By: agency.Approved_By,
      Applicant_Role: agency.UserID ? agency.UserID.Role : 'User',
      Applicant_Username: agency.UserID ? agency.UserID.Username : null,
      Applicant_EmailId: agency.UserID ? agency.UserID.EmailId : null,
    };

    await new AdminModel({
      adminID: req.user._id,
      action: 'View agency details',
      targetID: agency._id,
      targetModel: 'Agency',
      details: `Admin ${adminUser.Username} viewed details of agency ${agency.AgencyName} (AgencyID: ${agencyID})`,
    }).save();

    res.status(200).json({
      success: true,
      message: `Agency with AgencyID ${agencyID} retrieved successfully`,
      data: agencyData,
    });
  } catch (error) {
    console.error('Error fetching agency:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message,
    });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    // Verify user authentication
    if (!req.user || !req.user._id || (!req.user.role && !req.user.Role)) {
      console.error(`Authentication failed: req.user=${JSON.stringify(req.user)}`);
      return res.status(401).json({
        success: false,
        message: "User not authenticated or role not provided",
      });
    }

    // Verify user exists in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error(`User not found: _id=${req.user._id}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate user role from database, handling case-sensitivity
    const userRole = user.role || user.Role;
    if (!userRole) {
      console.error(`User role missing in database: user=${JSON.stringify(user)}`);
      return res.status(400).json({
        success: false,
        message: "User role is missing in database",
      });
    }

    const { id } = req.params;
    const { status, comments } = req.body;

    // Log incoming parameters for debugging
    console.log(`Received request: method=${req.method}, url=${req.originalUrl}, params=${JSON.stringify(req.params)}, body=${JSON.stringify(req.body)}, user=${JSON.stringify({ _id: req.user._id, role: req.user.role, Role: req.user.Role })}`);

    // Validate inputs
    if (!id || !status) {
      console.error(`Validation failed: id=${id}, status=${status}`);
      return res.status(400).json({
        success: false,
        message: "ID and status are required",
      });
    }

    const normalizedRole = userRole.toLowerCase();

    // Determine type by querying models
    let type, record;
    const deliveryStaff = await DeliveryStaff.findOne({ ApplicationID: id });
    if (deliveryStaff) {
      type = "deliverystaff";
      record = deliveryStaff;
    } else {
      const customer = await Customer.findOne({ RegistrationID: id });
      if (customer) {
        type = "customer";
        record = customer;
      } else {
        const agency = await AgencyModel.findOne({ RegistrationID: id });
        if (agency) {
          type = "agency";
          record = agency;
        } else {
          return res.status(404).json({
            success: false,
            message: `Record not found for ID ${id}`,
          });
        }
      }
    }

    // Role-based access control
    if (type === "agency" && normalizedRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only Admins can update agency status",
      });
    }
    if (["deliverystaff", "customer"].includes(type) && !["admin", "agency"].includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized: Only Admins and Agency can update ${type} status`,
      });
    }

    // Common agency validation for deliveryStaff and customer types
    let agency = null;
    if (normalizedRole === "agency" && ["deliverystaff", "customer"].includes(type)) {
      if (!req.user.AgencyID) {
        return res.status(403).json({
          success: false,
          message: "AgencyID not found in user profile",
        });
      }
      agency = await AgencyModel.findOne({ AgencyID: req.user.AgencyID });
      if (!agency) {
        return res.status(404).json({
          success: false,
          message: `Agency with AgencyID ${req.user.AgencyID} not found`,
        });
      }
    }

    if (type === "deliverystaff") {
      // Delivery staff specific logic
      if (normalizedRole === "agency" && !req.user.AgencyID) {
        return res.status(403).json({
          success: false,
          message: "AgencyID required for agency role",
        });
      }

      // Validate status
      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be 'Approved' or 'Rejected'",
        });
      }

      // Verify AgencyID match
      if (normalizedRole === "agency" && record.AgencyID !== req.user.AgencyID) {
        return res.status(403).json({
          success: false,
          message: `Unauthorized: ApplicationID ${id} does not belong to AgencyID ${req.user.AgencyID}`,
        });
      }

      // Check if already processed
      if (record.Approval_Status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: `Application already ${record.Approval_Status}`,
        });
      }

      // Update status
      record.Approval_Status = status;
      record.Status = status === "Approved" ? "Active" : "Inactive";

      // Save (triggers EmployeeID generation for Approved status)
      await record.save();

      return res.status(200).json({
        success: true,
        message: `Delivery staff application ${status} successfully`,
        data: {
          ApplicationID: record.ApplicationID,
          EmployeeID: record.EmployeeID,
          AgencyID: record.AgencyID,
          StaffName: record.StaffName,
          Approval_Status: record.Approval_Status,
          Status: record.Status,
        },
      });

    } else if (type === "customer") {
      // Customer specific logic
      // Validate status
      if (!["Approved", "Denied"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be 'Approved' or 'Denied'",
        });
      }

      // Validate comments length
      if (comments && comments.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Comments must not exceed 500 characters",
        });
      }

      // Check if already processed
      if (record.Approval_Status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: `Customer is already ${record.Approval_Status}`,
        });
      }

      // Update customer status
      record.Approval_Status = status;
      record.Approved_By = {
        _id: user._id,
        username: user.Username,
        role: userRole,
      };

      if (status === "Approved") {
        record.Approval_Date = new Date();
        record.State_Of_Approve = "Approved";
      } else {
        record.State_Of_Approve = "Denied";
      }

      if (comments) {
        record.Comments = comments;
      }

      await record.save(); // Triggers CustomerSchema.pre('save') for CustomerID

      // Find agency for logging
      const agencyID = agency ? agency.AgencyID : record.AgencyID;

      // Logging
      console.log(`Customer ${record.CustomerName} (RegistrationID: ${id}, CustomerID: ${record.CustomerID}, AgencyID: ${agencyID}) ${status.toLowerCase()} by ${userRole} ${user.Username}`);

      return res.status(200).json({
        success: true,
        message: `Customer ${status.toLowerCase()} successfully${agencyID && status === "Approved" ? ` (Assigned AgencyID: ${agencyID})` : ''}`,
        data: {
          CustomerName: record.CustomerName,
          Approval_Status: record.Approval_Status,
          Approval_Date: record.Approval_Date,
          Applied_Date: record.CreatedAt,
          RegistrationID: record.RegistrationID,
          CustomerID: record.CustomerID || null,
          Approved_By: record.Approved_By,
          AgencyID: record.AgencyID,
        },
      });

    } else {
      // Agency specific logic
      // Validate status
      if (!["Approved", "Denied"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be 'Approved' or 'Denied'",
        });
      }

      // Validate comments length
      if (comments && comments.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Comments must not exceed 500 characters",
        });
      }

      // Check if already processed
      if (record.Approval_Status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: `Agency is already ${record.Approval_Status}`,
        });
      }

      // Validate agency address for approval
      if (status === "Approved" && (!record.AgencyAddress || !record.AgencyAddress.State || !record.AgencyAddress.City)) {
        return res.status(400).json({
          success: false,
          message: "AgencyAddress is incomplete and required for approval",
        });
      }

      // Update agency status
      record.Approval_Status = status;
      record.Approved_By = {
        _id: user._id,
        username: user.Username,
        role: userRole,
      };

      if (status === "Approved") {
        record.Approval_Date = new Date();
      }

      await record.save();

      // Log admin action
      await new AdminModel({
        adminID: user._id,
        action: `Agency ${status.toLowerCase()}`,
        targetID: record._id,
        targetModel: "Agency",
        details: `Agency ${record.AgencyName} (RegistrationID: ${id}${record.AgencyID ? `, AgencyID: ${record.AgencyID}` : ''}) was ${status.toLowerCase()} by admin ${user.Username}`,
        comments: comments || null,
      }).save();

      return res.status(200).json({
        success: true,
        message: `Agency ${status.toLowerCase()} successfully${record.AgencyID && status === "Approved" ? ` (Assigned AgencyID: ${record.AgencyID})` : ''}`,
        data: {
          AgencyName: record.AgencyName,
          Approval_Status: record.Approval_Status,
          Approval_Date: record.Approval_Date,
          Applied_Date: record.Applied_Date,
          RegistrationID: record.RegistrationID,
          AgencyID: record.AgencyID,
          Approved_By: record.Approved_By,
        },
      });
    }
  } catch (error) {
    console.error(`Error updating status:`, {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};