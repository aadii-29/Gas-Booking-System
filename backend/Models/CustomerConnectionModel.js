const mongoose = require('mongoose');
const { CYLINDER_TYPES, CYLINDER_TYPE_ENUM, SECURITY_DEPOSITS, CHARGES } = require('./constants');

const CustomerConnectionSchema = new mongoose.Schema({
  CustomerID: { type: String, ref: "Customer", required: true },
  ConnectionType: { type: String, enum: ["Domestic", "Commercial"], required: true },
  Status: { type: String, enum: ["Pending", "Active", "Inactive"], default: "Pending" },
  ProductType: { type: String, enum: CYLINDER_TYPE_ENUM, required: true },
  CylinderPrice: { 
    type: Number, 
    required: true, 
    default: function() { return CYLINDER_TYPES[this.ProductType]; } 
  },
  NumberOfCylinders: { type: Number, required: true, default: 1, min: 1 },
  IsPMUY: { type: Boolean, default: false },
  HasLOTValve: { type: Boolean, default: false },
  CylinderSize: { type: String, enum: ["5kg", "14.2kg", "19kg", "47.5kg"], required: true },
  TotalCost: { 
    type: Number, 
    required: true, 
    default: function() {
      const type = this.ConnectionType;
      return SECURITY_DEPOSITS[type][this.CylinderSize] +
        (this.IsPMUY ? CHARGES.InstallationAndDemo[type].PMUY : CHARGES.InstallationAndDemo[type].regular) +
        CHARGES.VisitCharge[type] +
        CHARGES.AdditionalFixedCharge +
        (this.IsPMUY ? CHARGES.DGCC[type].PMUY : CHARGES.DGCC[type].regular) +
        CHARGES.ExtraCharge +
        (this.NumberOfCylinders * this.CylinderPrice);
    } 
  },
  SecurityDepositCylinder: { 
    type: Number, 
    required: true, 
    default: function() {
      const type = this.ConnectionType;
      const size = this.CylinderSize;
      if (size === "19kg" && this.HasLOTValve) return SECURITY_DEPOSITS[type]["19kg_LOT"];
      if (size === "47.5kg" && this.HasLOTValve) return SECURITY_DEPOSITS[type]["47.5kg_LOT"];
      if (size === "47.5kg") return SECURITY_DEPOSITS[type]["47.5kg"];
      if (size === "19kg") return SECURITY_DEPOSITS[type]["19kg"];
      return SECURITY_DEPOSITS[type][size];
    } 
  },
  SecurityDepositRegulator: { 
    type: Number, 
    required: true, 
    default: function() { return SECURITY_DEPOSITS[this.ConnectionType].Pressure_Regulator; } 
  },
  InstallationCharges: { 
    type: Number, 
    required: true, 
    default: function() {
      return this.IsPMUY ? CHARGES.InstallationAndDemo[this.ConnectionType].PMUY : CHARGES.InstallationAndDemo[this.ConnectionType].regular;
    } 
  },
  DGCCCharges: { 
    type: Number, 
    required: true, 
    default: function() {
      return this.IsPMUY ? CHARGES.DGCC[this.ConnectionType].PMUY : CHARGES.DGCC[this.ConnectionType].regular;
    } 
  },
  BookletPrice: { type: Number, required: true, immutable: true, default: 60 },
  AgencyID: { type: String, ref: "Agency", required: true },
  AgencyName: { type: String, required: true },
}, { timestamps: true });

CustomerConnectionSchema.pre('save', function(next) {
  const type = this.ConnectionType;
  if (this.isModified('ProductType')) this.CylinderPrice = CYLINDER_TYPES[this.ProductType];
  if (this.isModified('CylinderSize') || this.isModified('HasLOTValve') || this.isModified('ConnectionType')) {
    const size = this.CylinderSize;
    this.SecurityDepositCylinder = size === "19kg" && this.HasLOTValve ? SECURITY_DEPOSITS[type]["19kg_LOT"] :
      size === "47.5kg" && this.HasLOTValve ? SECURITY_DEPOSITS[type]["47.5kg_LOT"] : SECURITY_DEPOSITS[type][size];
    this.SecurityDepositRegulator = SECURITY_DEPOSITS[type].Pressure_Regulator;
  }
  if (this.isModified('IsPMUY') || this.isModified('ConnectionType')) {
    this.InstallationCharges = this.IsPMUY ? CHARGES.InstallationAndDemo[type].PMUY : CHARGES.InstallationAndDemo[type].regular;
    this.DGCCCharges = this.IsPMUY ? CHARGES.DGCC[type].PMUY : CHARGES.DGCC[type].regular;
  }
  if (this.isModified('ProductType') || this.isModified('NumberOfCylinders') || this.isModified('CylinderSize') || this.isModified('IsPMUY') || this.isModified('ConnectionType')) {
    this.TotalCost = this.SecurityDepositCylinder + this.InstallationCharges + CHARGES.VisitCharge[type] + CHARGES.AdditionalFixedCharge + this.DGCCCharges + CHARGES.ExtraCharge + (this.NumberOfCylinders * this.CylinderPrice);
  }
  next();
});

module.exports = mongoose.model("CustomerConnection", CustomerConnectionSchema);