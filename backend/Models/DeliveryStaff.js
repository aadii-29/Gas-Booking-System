const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaffAddressSchema = new Schema({
  FlatNo: { type: String, required: true, trim: true },
  Building_Society_Name: { type: String, required: true, trim: true },
  Area: { type: String, required: true, trim: true },
  City: { type: String, required: true, trim: true },
  State: { type: String, required: true, trim: true },
  Pincode: {
    type: String,
    required: true,
    match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
    trim: true,
  },
});

const deliveryStaffSchema = new Schema(
  {
    ApplicationID: { type: String, unique: true, trim: true },
    UserID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    AgencyID: { type: String, required: true, trim: true },
    EmployeeID: { type: String, unique: true, sparse: true, trim: true },
    StaffName: { type: String, required: true, trim: true },
    DOB: { type: Date, required: true },
    StaffMobileNo: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'],
      trim: true,
    },
    StaffEmail: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid Email-ID'],
      trim: true,
    },
    StaffAddress: { type: StaffAddressSchema, required: true },
    AadharNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhar number'],
      trim: true,
    },
    JoiningDate: { type: Date, default: Date.now },
    Salary: { type: Number, required: true },
    Approval_Status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    Status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    Documents: {
      AadharDocument: { type: String, required: true, trim: true },
      StaffPhoto: { type: String, required: true, trim: true },
      StaffSignature: { type: String, required: true, trim: true },
    },
    AssignedArea: [{ type: String, trim: true }],
    Approved_By: {
      _id: { type: Schema.Types.ObjectId, ref: 'User' },
      username: { type: String, default: '' },
      role: { type: String, default: '' }
    },
    Approval_Date: { type: Date },
  },
  { timestamps: true }
);

// Pre-save hook for deliveryStaffSchema
deliveryStaffSchema.pre('save', async function (next) {
  try {
    // Generate ApplicationID for new document
    if (this.isNew && !this.ApplicationID) {
      this.ApplicationID = await generateApplicationID();
      console.log('Generated ApplicationID:', this.ApplicationID);
    }

    // Generate EmployeeID after Approval
    if (
      this.isModified('Approval_Status') &&
      this.Approval_Status === 'Approved' &&
      !this.EmployeeID
    ) {
      if (!this.AgencyID) {
        throw new Error('AgencyID is required to generate EmployeeID');
      }

      let newEmployeeID;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      // Retry generating a unique EmployeeID up to maxAttempts
      while (!isUnique && attempts < maxAttempts) {
        newEmployeeID = await generateEmployeeID(this, attempts);
        console.log('Attempting EmployeeID:', newEmployeeID);

        const existingEmployee = await mongoose.model('DeliveryStaff').findOne({
          EmployeeID: newEmployeeID,
        });
        isUnique = !existingEmployee;
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Unable to generate unique EmployeeID after maximum attempts');
      }

      this.EmployeeID = newEmployeeID;
      console.log('Assigned EmployeeID:', this.EmployeeID);
    }

    // Validate Approved_By when Approval_Status is Approved or Rejected
    if (
      this.isModified('Approval_Status') &&
      ['Approved', 'Rejected'].includes(this.Approval_Status) &&
      !this.Approved_By?._id
    ) {
      throw new Error('Approved_By._id is required when Approval_Status is Approved or Rejected');
    }

    next();
  } catch (error) {
    console.error('Pre-save error:', {
      message: error.message,
      stack: error.stack,
      agencyID: this.AgencyID,
      employee: this._id,
    });
    next(error);
  }
});

// Utility function to generate ApplicationID
async function generateApplicationID() {
  try {
    const DeliveryStaff = mongoose.models.DeliveryStaff || mongoose.model('DeliveryStaff', deliveryStaffSchema);
    const count = await DeliveryStaff.countDocuments();
    const date = new Date();
    const year = String(date.getFullYear()).slice(-2); // Last two digits of the year
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const applicationID = `APP${year}${month}${day}${String(count + 1).padStart(10, '0')}`;
    console.log('Generated ApplicationID:', applicationID);
    return applicationID;
  } catch (error) {
    console.error('Failed to generate ApplicationID:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Utility function to generate EmployeeID
async function generateEmployeeID(employee, attempt = 0) {
  try {
    if (!employee.AgencyID) {
      throw new Error('AgencyID is required to generate EmployeeID');
    }

    const agencyPrefix = employee.AgencyID.substring(0, 4).toUpperCase();
    const DeliveryStaff = mongoose.models.DeliveryStaff || mongoose.model('DeliveryStaff', deliveryStaffSchema);

    // Find the last EmployeeID for this AgencyID, sorted by EmployeeID descending, only for approved staff
    const lastEmployee = await DeliveryStaff.findOne({
      AgencyID: employee.AgencyID,
      EmployeeID: { $exists: true, $ne: null },
      Approval_Status: 'Approved',
    })
      .sort({ EmployeeID: -1 })
      .select('EmployeeID Approval_Status');

    console.log('Last EmployeeID found:', {
      EmployeeID: lastEmployee ? lastEmployee.EmployeeID : 'None',
      Approval_Status: lastEmployee ? lastEmployee.Approval_Status : 'N/A',
    });

    let nextNumber = 1 + attempt; // Default to 1 + attempt if no previous EmployeeID
    if (lastEmployee && lastEmployee.EmployeeID) {
      // Extract the numeric part of the last EmployeeID (e.g., "000001")
      const numericPart = lastEmployee.EmployeeID.slice(agencyPrefix.length + 3); // Skip prefix and "EMP"
      const lastNumber = parseInt(numericPart, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1 + attempt; // Increment from last number + attempt
      }
    }

    // Generate the new EmployeeID with padded number
    const sequentialNumber = String(nextNumber).padStart(6, '0');
    const newEmployeeID = `${agencyPrefix}EMP${sequentialNumber}`;
    console.log('Generated EmployeeID in function:', newEmployeeID);
    return newEmployeeID;
  } catch (error) {
    console.error('Failed to generate EmployeeID:', {
      message: error.message,
      stack: error.stack,
      agencyID: employee.AgencyID,
      attempt,
    });
    throw error;
  }
}

module.exports = mongoose.models.DeliveryStaff || mongoose.model('DeliveryStaff', deliveryStaffSchema);