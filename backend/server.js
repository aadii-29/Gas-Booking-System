const express = require('express');
const connectDB = require('./Config/dbconfig');
const authRoutes = require('./Routes/authRoutes');
const customerRoutes = require('./Routes/customerRoutes');
const bookingRoutes = require('./Routes/bookingRoutes');
const cylinderRoutes = require('./Routes/cylinderRoutes');
const assignmentRoutes = require('./Routes/assignmentRoutes');
const agencyRoutes = require('./Routes/agencyRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const passwordRoutes = require('./Routes/passwordRoutes');
const deliveryStaffRoutes = require('./Routes/deliveryStaffRoutes');
const employeeRoutes = require('./Routes/employeeRoutes');
const permissionRoutes = require('./Routes/permissionRoutes');

const errorHandler = require('./Middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const compression = require('compression');
const fs = require('fs');
const path = require('path');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Frontend origin
  credentials: true, // Allow cookies and Authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow required headers
  preflightContinue: false, // Handle OPTIONS requests explicitly
  optionsSuccessStatus: 204, // Respond with 204 for OPTIONS requests
}));

// Middleware
app.use(express.json());
app.use(compression());
app.use(cookieParser());
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Start server with DB connection
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/pswd/', passwordRoutes);
    app.use('/api/customer', customerRoutes);
    app.use('/api/booking', bookingRoutes);
    app.use('/api/cylinder', cylinderRoutes);
    app.use('/api/assignment', assignmentRoutes);
    app.use('/api/agency', agencyRoutes);
    app.use('/api/auth/agency', employeeRoutes);
    app.use('/api/admin', adminRoutes);
        app.use('/api/permissions', permissionRoutes);
    app.use('/api/auth/agency/delivery_staff', deliveryStaffRoutes);

    // Create upload directories
    const uploadDirs = [
      path.join(__dirname, 'Uploads', 'temp'),
      path.join(__dirname, 'Uploads', 'Profile-Pictures'),
    ];
    uploadDirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    app.use(errorHandler);

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.stack);
    process.exit(1);
  }
};

// Start the server
startServer();