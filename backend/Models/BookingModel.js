const mongoose = require("mongoose");
const Schema = mongoose.Schema;

async function generateNextDeliveryID() {
  const lastBooking = await mongoose
    .model("Booking")
    .findOne({ DeliveryID: { $ne: null } }, { DeliveryID: 1 })
    .sort({ createdAt: -1 });

  let nextNumericPart = 1;

  if (lastBooking && lastBooking.DeliveryID) {
    const match = lastBooking.DeliveryID.match(/^DL(\d+)/);
    if (match && match[1]) {
      const numericPart = parseInt(match[1], 10);
      if (!isNaN(numericPart)) {
        nextNumericPart = numericPart + 1;
      }
    }
  }

  const timestamp = Date.now().toString().slice(-6);
  const paddedNumeric = String(nextNumericPart).padStart(15, "0");

  return `DL${paddedNumeric}${timestamp}`;
}

// Helper function to generate the next BookingID with improved uniqueness
async function generateNextBookingID() {
  const lastBooking = await mongoose
    .model("Booking")
    .findOne({}, { BookingID: 1 })
    .sort({ createdAt: -1 });
  let nextNumericPart = 1;

  if (lastBooking && lastBooking.BookingID) {
    const match = lastBooking.BookingID.match(/^BK(\d+)$/);
    if (match && match[1]) {
      const numericPart = parseInt(match[1], 10);
      if (!isNaN(numericPart)) {
        nextNumericPart = numericPart + 1;
      }
    }
  }

  const timestamp = Date.now().toString().slice(-6);
  // Ensure the numeric part is padded to 15 digits without scientific notation
  const paddedNumeric = nextNumericPart.toString().padStart(15, "0");

  return `BK${paddedNumeric}${timestamp}`;
}

const bookingSchema = new Schema(
  {
    BookingID: {
      type: String,
      unique: true,
    },
    CustomerID: {
      type: String,
      required: true,
      ref: "Customer",
    },
    Payment_Mode: {
      type: String,
      required: true,
      enum: ["Online", "Cash", "Debit-Card", "Credit-Card"],
    },
    DeliveryDate: {
      type: Date,
    },
    BookingDate: {
      type: Date,
      default: Date.now,
    },
    EmployeeID: {
      type: String,
      ref: "DeliveryStaff",
    },
    EmployeeMobileNo: {
      type: String,
    },
    Cylinder_Quantity: {
      type: Number,
      default: 1,
    },
    Payment: {
      type: String,
      default: "PENDING",
      enum: ["PENDING", "PAID", "FAILED"],
    },
    OTP: {
      type: String,
      required: true,
    },
    TotalAmount: {
      Cylinder_Base_Price: { type: Number, required: true },
      GST: { type: Number, required: true },
      Cylinder_Price: { type: Number, required: true },
    },
    Expected_Delivery_Date: {
      type: Date,
      required: true,
    },
    AgencyID: {
      type: String,
      required: true,
      ref: "Agency",
    },
    AgencyName: {
      type: String,
      required: true,
    },
    AgencyAddress: {
      type: String,
      required: true,
    },
    DeliveryID: {
      type: String,
      unique: true,
      sparse: true,
    },
    Status: {
      type: String,
      default: "Pending",
      enum: [
        "Pending",
        "Confirmed",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Failed",
      ],
    },
  },
  { timestamps: true }
);

// PRE-SAVE HOOK for BookingID generation only
bookingSchema.pre("save", async function (next) {
  console.log("Executing pre-save hook for Booking...");
  if (this.isNew && !this.BookingID) {
    try {
      this.BookingID = await generateNextBookingID();
      console.log(`Generated BookingID in pre-save: ${this.BookingID}`);
    } catch (error) {
      console.error("Error generating BookingID in pre-save hook:", error);
      return next(error);
    }
  }
  console.log("Calling next() in pre-save hook");
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);