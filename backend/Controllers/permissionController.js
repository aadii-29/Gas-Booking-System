const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const CustomerModel = require('../Models/CustomerModel');
const AgencyModel = require('../Models/AgencyModel');
const DeliveryStaff = require('../Models/DeliveryStaff');
require('dotenv').config();

// Valid permissions (aligned with UserSchema)
const VALID_PERMISSIONS = [
  'manage_users',
  'view_pending_applications',
  'apply_agency',
  'view_agency',
  'manage_password',
  'update_password',
  'manage_agencies',
  'application_status',
  'manage_customers',
  'manage_staff',
  'manage_delivery_staff',
  'view_reports',
  'approve_connections',
  'view_customers',
  'update_profile',
  'manage_application',
  'view_delivery_staff_application',
  'update_delivery_staff_application',
  'pending_delivery_staff_application',
  'view_dileverystaff_application',
  'view_agency_reports',
  'manage_inventory',
  'view_booking',
  'view_deliveries',
  'update_delivery_status',
  'view_customer_details',
  'book_cylinder',
  'view_connection_details',
  'apply_connection',"view_all_booking"
];

// Middleware to check for specific permission
exports.requirePermission = (permission) => async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user || !user.permissions.includes(permission)) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Insufficient permissions' });
    }
    req.userId = decoded._id;
    req.user = { _id: user._id, role: user.Role, permissions: user.permissions }; // Set req.user for roleMiddleware
    next();
  } catch (error) {
    console.error('Permission middleware error:', { error: error.message, stack: error.stack });
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Update permissions for a user by CustomerID, AgencyID, or EmployeeID
exports.updatePermissions = async (req, res) => {
  try {
    console.log('Starting updatePermissions with body:', req.body);
    const { CustomerID, AgencyID, EmployeeID, permissions, replace = false } = req.body;

    // Validate input: exactly one ID
    const idCount = [CustomerID, AgencyID, EmployeeID].filter(id => id).length;
    if (idCount !== 1) {
      console.error('Exactly one ID required', { CustomerID, AgencyID, EmployeeID });
      return res.status(400).json({ success: false, message: 'Exactly one of CustomerID, AgencyID, or EmployeeID must be provided' });
    }

    // Validate permissions
    if (!Array.isArray(permissions) || permissions.length === 0) {
      console.error('Invalid permissions array', { permissions });
      return res.status(400).json({ success: false, message: 'Permissions must be a non-empty array' });
    }
    const invalidPermissions = permissions.filter(p => !VALID_PERMISSIONS.includes(p));
    if (invalidPermissions.length > 0) {
      console.error('Invalid permissions:', { invalidPermissions });
      return res.status(400).json({ success: false, message: `Invalid permissions: ${invalidPermissions.join(', ')}` });
    }

    // Find user by ID (case-insensitive)
    const model = CustomerID ? CustomerModel : AgencyID ? AgencyModel : DeliveryStaff;
    const field = CustomerID ? 'CustomerID' : AgencyID ? 'AgencyID' : 'EmployeeID';
    const id = CustomerID || AgencyID || EmployeeID;
    console.log(`Fetching ${field}:`, id);
    const entity = await model.findOne({ [field]: { $regex: `^${id}$`, $options: 'i' } });
    if (!entity || !entity.UserID) {
      console.error(`${field} not found or not linked`, { [field]: id });
      return res.status(404).json({ success: false, message: `${field} not found or not linked to a user` });
    }

    // Update permissions
    const user = await User.findById(entity.UserID);
    if (!user) {
      console.error('User not found', { UserID: entity.UserID });
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const newPermissions = replace ? permissions : [...new Set([...user.permissions, ...permissions])];
    await User.updateOne({ _id: user._id }, { $set: { permissions: newPermissions } });

    return res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      userId: user._id,
      permissions: newPermissions
    });
  } catch (error) {
    console.error('Update permissions error:', { error: error.message, stack: error.stack, body: req.body });
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

