const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const AdminModel = require('../Models/AdminModel');
const AgencyModel = require('../Models/AgencyModel');
const CustomerModel = require('../Models/CustomerModel');
const DeliveryStaff = require('../Models/DeliveryStaff');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '1d';

// Validate JWT configuration
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('ERROR: JWT_SECRET or JWT_REFRESH_SECRET environment variable is not defined');
  process.exit(1);
}

exports.register = async (req, res) => {
  try {
    const { Username, EmailId, Password, MobileNumber } = req.body;

    if (!Username || !EmailId || !Password || !MobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Username, EmailId, Password, MobileNumber) are required',
      });
    }

    const existingUser = await User.findOne({ EmailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = new User({
      Username,
      EmailId,
      Password,
      MobileNumber,
      Role: 'User',
    });

    await user.save();

    const accessToken = jwt.sign(
      { _id: user._id, role: user.Role, permissions: user.permissions },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign({ _id: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.Username,
        email: user.EmailId,
        role: user.Role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error.message}`,
    });
  }
};

exports.login = async (req, res) => {
  try {
    let { EmailId, AgencyID, CustomerID, EmployeeID, Password } = req.body;
    let user;
    let loginType = '';

    if (!Password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    if (EmailId) {
      user = await User.findOne({ EmailId: { $regex: `^${EmailId}$`, $options: 'i' } }).select('+Password');
      loginType = 'EmailId';
    }

    if (!user && AgencyID) {
      const agency = await AgencyModel.findOne({ AgencyID: { $regex: `^${AgencyID}$`, $options: 'i' } });
      if (agency) {
        user = await User.findById(agency.UserID).select('+Password');
        loginType = 'AgencyID';
      }
    }

    if (!user && CustomerID) {
      const customer = await CustomerModel.findOne({ CustomerID: { $regex: `^${CustomerID}$`, $options: 'i' } });
      if (customer) {
        user = await User.findById(customer.UserID).select('+Password');
        loginType = 'CustomerID';
      }
    }

    if (!user && EmployeeID) {
      const deliveryStaff = await DeliveryStaff.findOne({ EmployeeID: { $regex: `^${EmployeeID}$`, $options: 'i' } });
      if (deliveryStaff) {
        user = await User.findById(deliveryStaff.UserID).select('+Password');
        loginType = 'EmployeeID';
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Invalid ${loginType || 'credentials'}`,
      });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    let agencyId = null;
    let customerId = null;
    let employeeId = null;

    if (user.Role.toLowerCase() === 'agency') {
      const agency = await AgencyModel.findOne({ UserID: user._id });
      if (agency) {
        agencyId = agency.AgencyID;
      }
    }

    if (user.Role.toLowerCase() === 'customer') {
      const customer = await CustomerModel.findOne({ UserID: user._id });
      if (customer) {
        customerId = customer.CustomerID;
      }
    }

    if (user.Role.toLowerCase() === 'deliverystaff') {
      const deliveryStaff = await DeliveryStaff.findOne({ UserID: user._id });
      if (deliveryStaff) {
        employeeId = deliveryStaff.EmployeeID;
      }
    }

    const accessToken = jwt.sign(
      {
        _id: user._id,
        role: user.Role,
        permissions: user.permissions || [],
        AgencyID: agencyId,
        CustomerID: customerId,
        EmployeeID: employeeId,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      {
        _id: user._id,
        role: user.Role,
        permissions: user.permissions || [],
        AgencyID: agencyId,
        CustomerID: customerId,
        EmployeeID: employeeId,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        username: user.Username,
        email: user.EmailId,
        role: user.Role,
        AgencyID: agencyId,
        CustomerID: customerId,
        EmployeeID: employeeId,
      },
    });
  } catch (error) {
    console.error('Login error:', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  } 
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign(
      { _id: user._id, role: user.Role, permissions: user.permissions },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: 'Access token refreshed' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies.accessToken;

  let username = null;
  let role = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded._id);
      if (user) {
        username = user.Username;
        role = user.Role;
      }
    } catch (err) {
      // Token might be expired or invalid
    }
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    user: {
      username,
      role,
    },
  });
};

exports.userinfo = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided or invalid token',
      });
    }

    const user = await User.findById(req.user._id).select(
      '_id Username EmailId Role permissions loginCount profilePicture'
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userInfo = {
      id: user._id,
      username: user.Username,
      email: user.EmailId,
      role: user.Role,
      permissions: user.permissions || [],
      loginCount: user.loginCount || 0,
      profilePicture: user.profilePicture,
      AgencyID: undefined, // Initialize to avoid undefined properties
      CustomerID: undefined,
      EmployeeID: undefined,
    };

    if (user.Role.toLowerCase() === 'agency') {
      const agency = await AgencyModel.findOne({ UserID: user._id }).select(
        'AgencyID RegistrationID Approval_Status'
      );
      if (agency) {
        userInfo.AgencyID = agency.AgencyID;
        userInfo.agency = {
          AgencyID: agency.AgencyID,
          RegistrationID: agency.RegistrationID,
          Approval_Status: agency.Approval_Status,
        };
      }
    }

    if (user.Role.toLowerCase() === 'customer') {
      const customer = await CustomerModel.findOne({ UserID: user._id }).select(
        'CustomerID RegistrationID CustomerName Approval_Status AgencyID'
      );
      if (customer) {
        userInfo.CustomerID = customer.CustomerID;
        userInfo.customer = {
          CustomerID: customer.CustomerID,
          RegistrationID: customer.RegistrationID,
          CustomerName: customer.CustomerName,
          Approval_Status: customer.Approval_Status,
          AgencyID: customer.AgencyID,
        };
      }
    }

    if (user.Role.toLowerCase() === 'deliverystaff') {
      const deliveryStaff = await DeliveryStaff.findOne({ UserID: user._id }).select(
        'EmployeeID ApplicationID Approval_Status'
      );
      if (deliveryStaff) {
        userInfo.EmployeeID = deliveryStaff.EmployeeID;
        userInfo.deliveryStaff = {
          EmployeeID: deliveryStaff.EmployeeID,
          ApplicationID: deliveryStaff.ApplicationID,
          Approval_Status: deliveryStaff.Approval_Status,
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: 'User information retrieved successfully',
      data: userInfo,
    });
  } catch (error) {
    console.error('Userinfo error:', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};


exports.uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      if (req.files?.ProfilePic) fs.unlinkSync(req.files.ProfilePic[0].path);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!req.files?.ProfilePic) {
      return res.status(400).json({ success: false, message: 'ProfilePic is required' });
    }

    const userDir = path.join(__dirname, '..', 'Uploads', 'users', req.user._id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const file = req.files.ProfilePic[0];
    const newFileName = `profile-${Date.now()}${path.extname(file.originalname)}`;
    const newFilePath = path.join(userDir, newFileName);
    fs.renameSync(file.path, newFilePath);

    if (user.profilePicture) {
      const oldImagePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const profilePicturePath = `/uploads/users/${req.user._id.toString()}/${newFileName}`;
    user.profilePicture = profilePicturePath;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.Username,
        email: user.EmailId,
        role: user.Role,
        permissions: user.permissions,
        loginCount: user.loginCount,
        profilePicture: profilePicturePath,
      },
    });
  } catch (error) {
    if (req.files?.ProfilePic) {
      fs.unlinkSync(req.files.ProfilePic[0].path);
    }
    console.error('Upload profile picture error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};