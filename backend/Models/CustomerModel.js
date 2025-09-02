const mongoose = require("mongoose");

const CustomerAddressSchema = new mongoose.Schema({
  FlatNo: { type: String, required: true, trim: true },
  Building_Society_Name: { type: String, required: true, trim: true },
  Area: { type: String, required: true, trim: true },
  City: { type: String, required: true, trim: true },
  State: { type: String, required: true, trim: true },
  Pincode: {
    type: String,
    required: true,
    match: [/^[0-9]{6}$/, "Please enter valid 6-digit pincode"],
  },
});

const BankSchema = new mongoose.Schema({
  BankName: { type: String, required: true, trim: true },
  AccountNumber: {
    type: String,
    required: true,
    validate: {
      validator: (v) => v.toString().length <= 15,
      message: "Account number cannot exceed 15 digits",
    },
  },
  IFSC: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"],
  },
  Branch: { type: String, required: true },
});

const CustomerSchema = new mongoose.Schema(
  {
    CustomerID: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
      default: undefined,
    },
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CustomerName: { type: String, required: true, trim: true },
    DOB: { type: Date, required: true },
    CustomerMobileNo: {
      type: Number,
      required: true,
      match: [/^[0-9]{10}$/, "Please enter valid 10-digit mobile number"],
    },
    CustomerEmailId: {
      type: String,
      unique: true,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter valid Email-ID"],
    },
    Connection_Mode: {
      type: String,
      enum: ["Regular", "Commercial"],
      required: true,
      default: "Regular",
    },
    CustomerAddress: { type: CustomerAddressSchema, required: true },
    AadharNumber: {
      type: Number,
      required: true,
      match: [/^[0-9]{12}$/, "Please enter valid 12-digit Aadhar number"],
    },
    AddressProof: {
      type: String,
      enum: ['AadharCard', 'VoterID', 'DrivingLicense', 'Lightbill', 'Rent-Agreement', 'Rashan-card', 'Title-Paper', 'Tax-Bill', 'Sale-Deed'],
      required: true,
    },
    Bank: { type: BankSchema, required: true },
    Alloted_Cylinder: { type: Number, required: true, min: 1, max: 2 },
    Remaining_Cylinder: { type: Number, required: true, max: 2 },
    Applied_Date: { type: Date, default: Date.now, required: true },
    Payment: { type: Number, required: true },
    Pending_Payment: { type: Number, required: true },
    SignatureDocument: { type: String, required: true },
    AadharDocument: { type: String, required: true },
    AddressProofDocument: { type: String, required: true },
    BankDocument: { type: String, required: true },
    ProfilePic: { type: String, required: true },
    RegistrationID: { type: String, required: false, unique: true },
    Approval_Date: { type: Date, default: null },
    Approval_Status: {
      type: String,
      enum: ["Pending", "Approved", "Denied"],
      required: true,
      default: "Pending",
    },
    State_Of_Approve: {
      type: String,
      required: true,
      default: "Pending Review",
    },
    Invoice_Number: { type: String, default: null },
    AgencyID: { type: String, ref: "Agency", required: true },
    Comments: { type: String, default: null },
    changePasswordUrl: { type: String },
  },
  { timestamps: true }
);

CustomerSchema.pre("save", async function (next) {
  try {
    // Generate RegistrationID for new customers
    if (this.isNew && !this.RegistrationID) {
      this.RegistrationID = await generateRegistrationID();
      console.log("Generated Customer RegistrationID:", this.RegistrationID);
    }
    // Generate CustomerID when approved
    if (
      this.isModified("Approval_Status") &&
      this.Approval_Status === "Approved" &&
      !this.CustomerID
    ) {
      if (!this.AgencyID) {
        throw new Error("AgencyID is required to generate CustomerID");
      }
      let newCustomerID;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique) {
        newCustomerID = await generateCustomerID(this, attempts);
        console.log("Attempting CustomerID:", newCustomerID);
        const existingCustomer = await mongoose.model("Customer").findOne({
          CustomerID: newCustomerID,
        });
        isUnique = !existingCustomer;
        attempts++;
      }
      this.CustomerID = newCustomerID;
      console.log("Assigned CustomerID:", this.CustomerID);
    }
    next();
  } catch (error) {
    console.error("Error in pre-save hook:", {
      message: error.message,
      stack: error.stack,
      agencyID: this.AgencyID,
      attempts,
    });
    next(error);
  }
});

async function generateCustomerID(customer, attempt = 0) {
  try {
    if (!customer.AgencyID) {
      throw new Error("AgencyID is required to generate CustomerID");
    }
    const agencyPrefix = customer.AgencyID.substring(0, 4);
    const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

    // Find the last CustomerID for this AgencyID, sorted by CustomerID descending, only for approved customers
    const lastCustomer = await Customer.findOne({
      AgencyID: customer.AgencyID,
      CustomerID: { $exists: true, $ne: null },
      Approval_Status: "Approved",
    })
      .sort({ CustomerID: -1 })
      .select("CustomerID Approval_Status");

    console.log("Last CustomerID found:", {
      CustomerID: lastCustomer ? lastCustomer.CustomerID : "None",
      Approval_Status: lastCustomer ? lastCustomer.Approval_Status : "N/A",
    });

    let nextNumber = 1 + attempt; // Default to 1 + attempt if no previous CustomerID
    if (lastCustomer && lastCustomer.CustomerID) {
      // Extract the numeric part of the last CustomerID (e.g., "000000000008")
      const numericPart = lastCustomer.CustomerID.slice(agencyPrefix.length + 2); // Skip prefix and "CU"
      const lastNumber = parseInt(numericPart, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1 + attempt; // Increment from last number + attempt
      }
    }

    // Generate the new CustomerID with padded number
    const sequentialNumber = String(nextNumber).padStart(12, "0");
    const newCustomerID = `${agencyPrefix}CU${sequentialNumber}`;
    console.log("Generated CustomerID in function:", newCustomerID);
    return newCustomerID;
  } catch (error) {
    console.error("Error generating CustomerID:", {
      message: error.message,
      stack: error.stack,
      agencyID: customer.AgencyID,
      attempt,
    });
    throw error;
  }
}

async function generateRegistrationID() {
  const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
  const count = await Customer.countDocuments();
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `REG${year}${month}${String(count + 1).padStart(12, "0")}`;
}

module.exports = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);