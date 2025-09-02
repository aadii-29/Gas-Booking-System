const mongoose = require('mongoose');

// Define the schema
const CylinderSchema = new mongoose.Schema({
  TotalCylinder: { type: Number, required: true, min: 0 },
  FilledCylinder: { 
    type: Number, 
    required: true, 
    min: 0, 
    validate: { 
      validator: function(v) { return v <= this.TotalCylinder; }, 
      message: 'Filled cylinders cannot exceed total cylinders' 
    } 
  },
  EmptyCylinder: { 
    type: Number, 
    required: true, 
    min: 0, 
    validate: { 
      validator: function(v) { return v <= this.TotalCylinder; }, 
      message: 'Empty cylinders cannot exceed total cylinders' 
    } 
  },
  CylinderDeliveryStatus: { 
    type: String, 
    enum: ['Pending', 'Delivered', 'On-the-way'], 
    required: true, 
    default: 'Pending' 
  },
  RegularCylinderBasePrice: { type: Number, required: true, min: 0 },
  CommercialCylinderBasePrice: { type: Number, required: true, min: 0 },
  GST: { type: Number, required: true, min: 0 },
  CylinderPrice: { type: Number, required: true, min: 0 },
  CylinderQuantity: { type: Number, required: true, min: 0 },
  CylinderCategory: { type: String, enum: ['Domestic', 'Commercial'], required: true }
}, { timestamps: true });

CylinderSchema.pre('save', function(next) {
  if (this.FilledCylinder + this.EmptyCylinder > this.TotalCylinder) {
    return next(new Error('Sum of filled and empty cylinders cannot exceed total cylinders'));
  }
  next();
});

// Export the model, ensuring it’s only compiled once
module.exports = mongoose.models.Cylinder || mongoose.model('Cylinder', CylinderSchema);