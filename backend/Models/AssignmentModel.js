const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  AssignmentID: { type: String, required: true, unique: true, trim: true },
  AssignmentDate: { type: Date, default: Date.now, required: true },
  EmployeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryStaff', required: true },
  EmployeeMobileNo: { 
    type: String, 
    required: true, 
    match: [/^[0-9]{10}$/, 'Please enter valid 10-digit mobile number'] 
  },
  TotalCylinder: { type: Number, required: true, min: 0 },
  FilledCylinder: { type: Number, required: true, min: 0 },
  EmptyCylinder: { type: Number, required: true, min: 0 },
  Cylinder_Delivery_Status: { 
    type: String, 
    enum: ['Pending', 'In-Progress', 'Delivered'], 
    required: true, 
    default: 'Pending' 
  },
  TotalPayment: { type: Number, required: true, min: 0 },
  ReceivedPaymentStatus: { 
    type: String, 
    enum: ['Pending', 'Partial', 'Received'], 
    required: true, 
    default: 'Pending' 
  }
}, { timestamps: true });

AssignmentSchema.pre('save', async function(next) {
  if (!this.AssignmentID) {
    const count = await this.constructor.countDocuments();
    this.AssignmentID = `ASN${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Assignment', AssignmentSchema);