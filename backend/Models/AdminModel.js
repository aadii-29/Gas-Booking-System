const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User model (admins are users with Role: 'Admin')
    required: false,
  },
  action: {
    type: String,
    required: true, // e.g., "Agency approved", "Agency denied"
  },
  targetID: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // e.g., Agency _id
    refPath: 'targetModel', // Dynamic reference to different models
  },
  targetModel: {
    type: String, 
    required: true,
    enum: ['Agency', 'User', 'Customer', 'DeliveryStaff'], // Add more as needed
  },
  details: {
    type: String,
    required: true, // Descriptive message
  },
  comments: {
    type: String,
    default: null, // Optional comments from admin
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.AdminModel || mongoose.model('AdminModel', adminSchema);