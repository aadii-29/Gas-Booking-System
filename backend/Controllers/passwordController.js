const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const AdminModel = require("../Models/AdminModel"); // Add this import
const AgencyModel = require("../Models/AgencyModel"); // Add this import
const CustomerModel = require("../Models/CustomerModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("dotenv").config();
const DeliveryStaff = require("../Models/DeliveryStaff");
// JWT configuration from environment variablesco
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "1d";

// Validate JWT configuration
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error(
    "ERROR: JWT_SECRET or JWT_REFRESH_SECRET environment variable is not defined"
  );
  process.exit(1);
}

// Initiate password reset for delivery staff
exports.updateDeliveryStaffPassword = async (req, res) => {
  try {
    const { EmployeeID, ApplicationID } = req.body;

    // Validate input
    if (!EmployeeID || !ApplicationID) {
      return res.status(400).json({
        success: false,
        message: 'EmployeeID and ApplicationID are required',
      });
    }

    // Find delivery staff
    const deliveryStaff = await DeliveryStaff.findOne({
      EmployeeID,
      ApplicationID,
    }).populate('UserID');
    if (!deliveryStaff) {
      return res.status(404).json({
        success: false,
        message: 'Delivery staff not found or invalid EmployeeID/ApplicationID',
      });
    }
   

    // Verify delivery staff is approved
    if (deliveryStaff.Approval_Status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Delivery staff is not approved. Current status: ${deliveryStaff.Approval_Status}`,
      });
    }

    // Validate UserID
    if (!deliveryStaff.UserID) {
      console.error('Delivery staff has no UserID:', { EmployeeID, ApplicationID });
      return res.status(400).json({
        success: false,
        message: 'Delivery staff is not linked to a user (UserID missing)',
      });
    }

    // Find associated user
    const user = await User.findById(deliveryStaff.UserID);
    if (!user) {
      console.error('User not found for UserID:', deliveryStaff.UserID);
      return res.status(400).json({
        success: false,
        message: 'Associated user not found',
      });
    }


    // Generate set password token
    const setPasswordToken = crypto.randomBytes(32).toString('hex');
    const setPasswordTokenHash = crypto.createHash('sha256').update(setPasswordToken).digest('hex');

    // Update user with token
    user.setPasswordToken = setPasswordTokenHash;
    user.setPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    try {
      await user.save();
    
    } catch (saveError) {
      console.error(`Failed to save user ${user.EmailId}: ${saveError.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to save user: ${saveError.message}`,
      });
    }

    // Generate SetPasswordUrl
    const SetPasswordUrl = `${process.env.FRONTEND_URL}/api/pswd/setPassword/${setPasswordToken}`;
    deliveryStaff.SetPasswordUrl = SetPasswordUrl;
    try {
      await deliveryStaff.save();
 
    } catch (saveError) {
      console.error(`Failed to save delivery staff ${deliveryStaff.ApplicationID}: ${saveError.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to save delivery staff: ${saveError.message}`,
      });
    }

    // Return response
    return res.status(200).json({
      success: true,
      message: 'Delivery staff password reset initiated successfully',
      data: {
        ApplicationID: deliveryStaff.ApplicationID,
        EmployeeID: deliveryStaff.EmployeeID,
        EmailId: user.EmailId,
        SetPasswordUrl,
      },
    });
  } catch (error) {
    console.error('Initiate delivery staff password reset error:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { EmailId } = req.body;

    if (!EmailId) {
      return res.status(400).json({
        success: false,
        message: "EmailId is required",
      });
    }

    const user = await User.findOne({ EmailId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/api/pswd/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: "Password reset link generated successfully",
      resetUrl,
    });
  } catch (error) {
    console.error("Forgot password error:", error.stack);
    res.status(500).json({
      success: false,
      message: `Failed to process request: ${error.message}`,
    });
  }
};

exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token: resetToken } = req.params;
    const { newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user with findOneAndUpdate
    const updateResult = await User.findOneAndUpdate(
      {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: { $gt: Date.now() },
      },
      {
        Password: hashedPassword,
        isTemporaryPassword: false,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updateResult) {
    
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error.stack);
    res.status(500).json({
      success: false,
      message: `Failed to update password: ${error.message}`,
    });
  }
};

exports.changePasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // Trim password to avoid whitespace issues
    const trimmedPassword = newPassword.trim();

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      changePasswordToken: tokenHash,
      changePasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Hash the trimmed password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
  
    user.Password = hashedPassword;
    user.isTemporaryPassword = false;
    user.changePasswordToken = undefined;
    user.changePasswordExpires = undefined;

    try {
      await user.save();
   
      // Verify the saved user
      const userAfterSave = await User.findById(user._id).select('+Password');
     

      // Manually verify hash
      const isMatch = await bcrypt.compare(trimmedPassword, userAfterSave.Password);

      if (!isMatch) {
        console.error('Password hash verification failed after save');
        return res.status(500).json({
          success: false,
          message: 'Failed to verify password after save',
        });
      }
    } catch (saveError) {
      console.error(`Failed to save user ${user.EmailId}: ${saveError.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to save user: ${saveError.message}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error.stack);
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
exports.updatePassword = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided or invalid token",
      });
    }

    const { oldPassword, newPassword } = req.body;

    // Validate inputs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Find user with password
    const user = await User.findById(req.user._id).select("+Password");
    if (!user) {
      console.error(`User not found for ID: ${req.user._id}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.Password);
    if (!isMatch) {
 
      return res.status(400).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password using findOneAndUpdate to avoid middleware
    const updateResult = await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        Password: hashedPassword,
        isTemporaryPassword: false,
        changePasswordToken: undefined,
        changePasswordExpires: undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updateResult) {
      console.error(`Failed to update password for user: ${user.EmailId}`);
      return res.status(500).json({
        success: false,
        message: "Failed to update password: Database error",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error.stack);
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
exports.checkResetStatus = async (req, res) => {
  try {
    const { EmailId, AgencyID, CustomerID } = req.body;

    if (!EmailId || (!AgencyID && !CustomerID)) {
      return res.status(400).json({
        success: false,
        message: "EmailId and either AgencyID or CustomerID are required",
      });
    }

    let targetModel, modelName;
    if (AgencyID) {
      const agency = await AgencyModel.findOne({ AgencyID });
      if (!agency) {
        return res.status(404).json({
          success: false,
          message: `Agency with AgencyID ${AgencyID} not found`,
        });
      }
      targetModel = agency;
      modelName = "Agency";
    } else {
      const customer = await CustomerModel.findOne({ CustomerID });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: `Customer with CustomerID ${CustomerID} not found`,
        });
      }
      targetModel = customer;
      modelName = "Customer";
    }

    const user = await User.findOne({ EmailId });
    if (!user || targetModel.UserID.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "EmailId does not match the agency/customer or user not found",
      });
    }

    if (
      !user.isTemporaryPassword ||
      !targetModel.changePasswordUrl ||
      user.changePasswordExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "No valid password reset found. Please request a new reset.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset status retrieved successfully.",
      changePasswordUrl: targetModel.changePasswordUrl,
    });
  } catch (error) {
    console.error("Check reset status error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to check reset status: ${error.message}`,
    });
  }
};

// Change Password (for temporary password)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(userId).select("+Password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.Password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    user.Password = newPassword;
    user.isTemporaryPassword = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error.stack);
    res.status(500).json({
      success: false,
      message: `Failed to change password: ${error.message}`,
    });
  }
};

exports.setInitialPassword = async (req, res) => {
  try {
    const { AgencyID, RegistrationID } = req.body;

    // Validate input
    if (!AgencyID || !RegistrationID) {
      return res.status(400).json({
        success: false,
        message: 'AgencyID and RegistrationID are required',
      });
    }

    // Find agency
    const agency = await AgencyModel.findOne({
      AgencyID: AgencyID,
      RegistrationID: RegistrationID,
    });
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found or invalid AgencyID/RegistrationID',
      });
    }
  
    // Verify agency is approved
    if (agency.Approval_Status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Agency is not approved. Current status: ${agency.Approval_Status}`,
      });
    }

    // Validate UserID
    if (!agency.UserID) {
      console.error('Agency has no UserID:', { AgencyID, RegistrationID });
      return res.status(400).json({
        success: false,
        message: 'Agency is not linked to a user (UserID missing)',
      });
    }

    // Find associated user
    const user = await User.findById(agency.UserID);
    if (!user) {
      console.error('User not found for UserID:', agency.UserID);
      return res.status(400).json({
        success: false,
        message: 'Associated user not found',
      });
    }
  
    // Generate set password token
    const setPasswordToken = crypto.randomBytes(32).toString('hex');
    const setPasswordTokenHash = crypto.createHash('sha256').update(setPasswordToken).digest('hex');

    // Update user with token
    user.setPasswordToken = setPasswordTokenHash;
    user.setPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    try {
      await user.save();
  
    } catch (saveError) {
      console.error(`Failed to save user ${user.EmailId}: ${saveError.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to save user: ${saveError.message}`,
      });
    }

    // Generate changePasswordUrl
    const changePasswordUrl = `${process.env.FRONTEND_URL}/api/pswd/setPassword/${setPasswordToken}`;
    agency.changePasswordUrl = changePasswordUrl;
    await agency.save();

    // Return response
    return res.status(200).json({
      success: true,
      message: 'Password set initiated successfully',
      data: {
        AgencyID: agency.AgencyID,
        RegistrationID: agency.RegistrationID,
        EmailId: user.EmailId,
        changePasswordUrl,
      },
    });
  } catch (error) {
    console.error('Set initial password error:', error.stack);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};


// Set password with token for any user
exports.setPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // Validate token format
    if (token.length !== 64 || !/^[0-9a-fA-F]+$/.test(token)) {
      console.error('Invalid token format:', token);
      return res.status(400).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // Find user by token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
   
    const user = await User.findOne({
      setPasswordToken: tokenHash,
      setPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.error('No user found for token hash:', tokenHash);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Check if user is linked to an agency, customer, or delivery staff
    let newRole = user.Role;
    const agency = await AgencyModel.findOne({ UserID: user._id });
    const customer = await CustomerModel.findOne({ UserID: user._id });
    const deliveryStaff = await DeliveryStaff.findOne({ UserID: user._id });

    if (agency) {
  
      newRole = 'Agency';
    } else if (customer) {
      
      newRole = 'Customer';
    } else if (deliveryStaff) {
    
      newRole = 'DeliveryStaff';
    } else {
   
      newRole = 'User'; // Default role
    }

    // Trim and hash password
    const trimmedPassword = newPassword.trim();
   
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
 

    // Set permissions based on Role
    let permissions = user.permissions || [];
    if (newRole !== user.Role || permissions.length === 0) {
    
      switch (newRole) {
        case 'Admin':
          permissions = [
            "manage_users",
          "view_pending_applications",
          "apply_agency",
          "view_agency",
          "manage_password",
          "update_password",
          "manage_agencies",
          "application_status",
          "manage_customers",
          "manage_staff",
          "manage_delivery_staff",
          "view_reports",
          "approve_connections",
          "view_customers",          "update_profile",
          "manage_application",
          "view_delivery_staff_application",
          "update_delivery_staff_application",   "pending_delivery_staff_application",     "view_dileverystaff_application",
          ];
          break;
        case 'Agency':
          permissions = [
            "manage_customers",
          "manage_staff",
          "view_agency",
          "view_agency_reports",
          "update_password",
          "application_status",
          "approve_connections",
          "manage_inventory",
          "manage_delivery_staff",  "view_booking",      "view_dileverystaff_application",
          "manage_application",
          "view_customers",          "update_profile",
          "view_delivery_staff_application",
          "update_delivery_staff_application","pending_delivery_staff_application",
     
          ];
          break;
        case 'DeliveryStaff':
          permissions = [
            'view_deliveries',
            'update_delivery_status',
            'update_password',
            'view_customer_details',"view_booking",
            'update_profile',        "view_dileverystaff_application",
          ];
          break;
        case 'Customer':
          permissions = [
            'book_cylinder',
            'view_connection_details',
            'update_password',
            'update_profile',"view_booking",
          ];
          break;
        case 'User':
          permissions = [
            'apply_connection',
            'apply_agency',
            'update_profile',
            'update_password',
            'application_status',        "view_dileverystaff_application",
          ];
          break;
        default:
          permissions = [];
      }
    }

    // Update user directly to avoid pre-save middleware
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          Password: hashedPassword,
          isTemporaryPassword: false,
          setPasswordToken: null,
          setPasswordExpires: null,
          Role: newRole,
          permissions: permissions,
        },
      }
    );

  
    // Clear SetPasswordUrl in linked model
    if (agency) {
      await AgencyModel.updateOne({ _id: agency._id }, { $set: { SetPasswordUrl: null } });
    
    } else if (customer) {
      await CustomerModel.updateOne({ _id: customer._id }, { $set: { SetPasswordUrl: null } });
     
    } else if (deliveryStaff) {
      await DeliveryStaff.updateOne({ _id: deliveryStaff._id }, { $set: { SetPasswordUrl: null } });
     
    }

    return res.status(200).json({
      success: true,
      message: 'Password set successfully',
      role: newRole,
      permissions: permissions,
    });
  } catch (error) {
    console.error('Set password with token error:', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

exports.setInitialCustomerPassword = async (req, res) => {
  try {
    const { CustomerID, RegistrationID } = req.body;

    // Validate input
    if (!CustomerID || !RegistrationID) {
      return res.status(400).json({
        success: false,
        message: 'CustomerID and RegistrationID are required',
      });
    }

    // Find customer
    const customer = await CustomerModel.findOne({
      CustomerID,
      RegistrationID,
    });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or invalid CustomerID/RegistrationID',
      });
    }
   

    // Verify customer is approved
    if (customer.Approval_Status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Customer is not approved. Current status: ${customer.Approval_Status}`,
      });
    }

    // Validate UserID
    if (!customer.UserID) {
      console.error('Customer has no UserID:', { CustomerID, RegistrationID });
      return res.status(400).json({
        success: false,
        message: 'Customer is not linked to a user (UserID missing)',
      });
    }

    // Find associated user
    const user = await User.findById(customer.UserID);
    if (!user) {
      console.error('User not found for UserID:', customer.UserID);
      return res.status(400).json({
        success: false,
        message: 'Associated user not found',
      });
    }
    console.log('User found:', { EmailId: user.EmailId, _id: user._id });

    // Generate set password token
    const setPasswordToken = crypto.randomBytes(32).toString('hex');
    const setPasswordTokenHash = crypto.createHash('sha256').update(setPasswordToken).digest('hex');

    // Update user with token
    user.setPasswordToken = setPasswordTokenHash;
    user.setPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    try {
      await user.save();
      console.log(`User ${user.EmailId} updated with set password token: ${setPasswordTokenHash}`);
    } catch (saveError) {
      console.error(`Failed to save user ${user.EmailId}: ${saveError.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to save user: ${saveError.message}`,
      });
    }

    // Generate changePasswordUrl
    const SetPasswordUrl = `${process.env.FRONTEND_URL}/api/pswd/setPassword/${setPasswordToken}`;
    customer.SetPasswordUrl = SetPasswordUrl;
    await customer.save();

    // Return response
    return res.status(200).json({
      success: true,
      message: 'Customer password set initiated successfully',
      data: {
        CustomerID: customer.CustomerID,
        RegistrationID: customer.RegistrationID,
        EmailId: user.EmailId,
        SetPasswordUrl,
      },
    });
  } catch (error) {
    console.error('Set initial customer password error:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
