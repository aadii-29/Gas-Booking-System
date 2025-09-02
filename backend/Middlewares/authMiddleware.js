const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const AgencyModel = require('../Models/AgencyModel');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  try {
   

    // Verify JWT secrets are loaded
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error('authMiddleware: JWT secrets not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT secrets not set',
      });
    }

    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];

    }

    let decoded;
    if (!token) {
      console.warn('authMiddleware: No access token provided, checking refresh token');
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        console.warn('authMiddleware: No refresh token provided');
        return res.status(401).json({
          success: false,
          message: 'No authentication token provided',
        });
      }

 
      let decodedRefresh;
      try {
        decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch (error) {
        console.warn('authMiddleware: Refresh token verification failed', {
          error: error.message,
          name: error.name,
        });
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }
    

      const user = await User.findById(decodedRefresh._id);
      if (!user) {
        console.warn('authMiddleware: User not found for refresh token', { userId: decodedRefresh._id });
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Fetch AgencyID for agency users
      let AgencyID = null;
      if (user.Role.toLowerCase() === 'agency') {
        const agency = await AgencyModel.findOne({ UserID: user._id });
        AgencyID = agency ? agency.AgencyID : decodedRefresh.AgencyID || null;
        console.log('authMiddleware: Agency lookup', { AgencyID, found: !!agency });
      }

      token = jwt.sign(
        { _id: user._id, role: user.Role, permissions: user.permissions || [], AgencyID },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

   
      decoded = { _id: user._id, role: user.Role, permissions: user.permissions || [], AgencyID };
    } else {

      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        console.warn('authMiddleware: Access token verification failed', {
          error: error.message,
          name: error.name,
        });
        return res.status(401).json({
          success: false,
          message: error.name === 'TokenExpiredError' ? 'Authentication token expired' : 'Invalid authentication token',
        });
      }
     }

    const user = await User.findById(decoded._id);
    if (!user) {
      console.warn('authMiddleware: User not found', { userId: decoded._id });
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = {
      _id: user._id,
      role: user.Role,
      permissions: user.permissions || [],
      AgencyID: decoded.AgencyID || null,
    };
    next();
  } catch (error) {
    console.error('authMiddleware: Unexpected error', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

module.exports = authMiddleware;