const mongoose = require('mongoose');

// AgencyAddress Sub-Schema
const AgencyAddressSchema = new mongoose.Schema({
  Area: { type: String, required: true, trim: true },
  City: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'City name must be at least 2 characters long'],
  },
  State: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'State name must be at least 2 characters long'],
  },
  Pincode: {
    type: Number,
    required: true,
    match: [/^[0-9]{6}$/, 'Please enter valid 6-digit pincode'],
  },
});

// ApprovedBy Sub-Schema
const ApprovedBySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  role: { type: String, required: true },
});

// Agency Schema
const AgencySchema = new mongoose.Schema({
  AgencyID: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,
  },
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  AgencyName: {
    type: String,
    required: true,
    trim: true,
  },
  AgencyEmail: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter valid Email-ID'],
  },
  AgencyMobileNo: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Invalid mobile number format'],
  },
  Gst_NO: {
    type: String,
    required: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter valid GST number'],
  },
  AgencyAddress: {
    type: AgencyAddressSchema,
    required: true,
  },
  Received_Payment: {
    type: Number,
    required: true,
    default: 0,
  },
  Pending_Payment: {
    type: Number,
    required: true,
    default: 0,
  },
  Total_Customer: {
    type: Number,
    required: true,
    default: 0,
  },
  RegistrationID: {
    type: String,
    unique: true,
    index: true,
  },
  Applied_Date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  Approval_Status: {
    type: String,
    enum: ['Pending', 'Approved', 'Denied'],
    required: true,
    default: 'Pending',
  },
  Approval_Date: {
    type: Date,
    default: null,
  },
  Approved_By: {
    type: ApprovedBySchema,
    default: null,
  },
}, { timestamps: true });

// Schema for sequence counter
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 },
});

// Counter model
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

// Pre-save hook for AgencySchema
AgencySchema.pre('save', async function (next) {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Generate RegistrationID for new documents
      if (this.isNew && !this.RegistrationID) {
        this.RegistrationID = await generateRegistrationID();
        console.log('Generated RegistrationID:', this.RegistrationID);
      }

      // Generate AgencyID when Approval_Status is set to 'Approved' and AgencyID is not yet set
      if (
        this.isModified('Approval_Status') &&
        this.Approval_Status === 'Approved' &&
        !this.AgencyID
      ) {
        if (!this.AgencyAddress || !this.AgencyAddress.State || !this.AgencyAddress.City) {
          throw new Error('AgencyAddress with State and City is required to generate AgencyID');
        }

        this.AgencyID = await generateAgencyID(this);
        console.log('Generated AgencyID:', this.AgencyID);
      }
      return next();
    } catch (error) {
      if (error.code === 11000 && retries < maxRetries - 1) {
        console.warn(`Duplicate key error on attempt ${retries + 1}, retrying...`, error);
        retries++;
        continue;
      }
      console.error('Error in pre-save hook:', {
        message: error.message,
        stack: error.stack,
        agency: this._id,
        retries,
      });
      return next(error);
    }
  }
});

// Utility function to generate RegistrationID
async function generateRegistrationID() {
  try {
    const Agency = mongoose.models.Agency || mongoose.model('Agency', AgencySchema);
    const year = new Date().getFullYear().toString().slice(-2); // e.g., '25' for 2025
    const counter = await Counter.findOneAndUpdate(
      { _id: `agency_registration_${year}` },
      { $inc: { sequence: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return `AGN${year}${String(counter.sequence).padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating RegistrationID:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Utility function to generate AgencyID
async function generateAgencyID(agency) {
  try {
    if (!agency.AgencyAddress || !agency.AgencyAddress.State || !agency.AgencyAddress.City) {
      throw new Error('AgencyAddress with State and City is required to generate AgencyID');
    }

    const stateCode = agency.AgencyAddress.State.substring(0, 2).toUpperCase();
    const cityCode = agency.AgencyAddress.City.substring(0, 2).toUpperCase();

    if (!stateCode || !cityCode) {
      throw new Error('Invalid State or City: unable to generate AgencyID');
    }

    const counterId = `agency_id_${stateCode}_${cityCode}`;
    const counter = await Counter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { sequence: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const sequentialNumber = String(counter.sequence).padStart(6, '0');
    const newAgencyID = `${stateCode}${cityCode}${sequentialNumber}`;
    console.log('Generated AgencyID:', newAgencyID);
    return newAgencyID;
  } catch (error) {
    console.error('Error generating AgencyID:', {
      message: error.message,
      stack: error.stack,
      state: agency.AgencyAddress?.State,
      city: agency.AgencyAddress?.City,
    });
    throw error;
  }
}

module.exports = mongoose.models.Agency || mongoose.model('Agency', AgencySchema);
