const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    Username: { type: String, required: true, trim: true },
    EmailId: {
      type: String,
      required: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    Password: { type: String, required: true, minlength: 8 },
    MobileNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Invalid mobile number format"],
    },
    Role: {
      type: String,
      enum: ["Admin", "Agency", "Deliverystaff", "Customer", "User"],
      required: true,
      default: "User",
      set: (v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
    },
    LinkedID: { type: String, unique: true, sparse: true },
    refreshToken: { type: String },
    tokenVersion: { type: Number, default: 0 },
    isTemporaryPassword: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    changePasswordToken: { type: String },
    changePasswordExpires: { type: Date },
    setPasswordToken: { type: String },
    setPasswordExpires: { type: Date },
    loginCount: { type: Number, default: 0 },
    profilePicture: { type: String },
    permissions: {
      type: [String],
      default: [],
      enum: [
        "manage_users",
        "view_pending_applications",
        "apply_agency",
        "view_agency",
        "manage_password",
        "update_password",
        "manage_agencies",
        "application_status",
        "manage_customers",
        "manage_staff",
        "manage_delivery_staff",
        "view_reports",
        "approve_connections",
        "view_customers",
        "update_profile",
        "view_all_booking",
        "manage_application",
        "view_delivery_staff_application",
        "update_delivery_staff_application",
        "pending_delivery_staff_application",
        "view_dileverystaff_application",
        "view_agency_reports",
        "manage_inventory",
        "view_booking",
        "view_deliveries",
        "update_delivery_status",
        "view_customer_details",
        "book_cylinder",
        "view_connection_details",
        "apply_connection"
      ],
    },
  },
  { timestamps: true }
);

// Pre-save middleware for password hashing and permissions
UserSchema.pre("save", async function (next) {
  // Normalize Role case
  this.Role = this.Role.charAt(0).toUpperCase() + this.Role.slice(1).toLowerCase();

  // Hash password if modified and not already hashed
  if (this.isModified("Password")) {
    try {
      const isHashed = await bcrypt.compare(this.Password, this.Password).catch(() => false);
      if (!isHashed) {
        console.log("Hashing plain text password for user:", this.EmailId);
        this.Password = await bcrypt.hash(this.Password, 10);
      }
    } catch (error) {
      console.error("Password hashing error:", error.message);
      return next(error);
    }
  }

  // Set default permissions only on user creation
  if (this.isNew) {
    console.log("Setting default permissions for new user with Role:", this.Role);
    switch (this.Role) {
      case "Admin":
        this.permissions = [
          "manage_users",        "view_all_booking",
          "view_pending_applications",
          "apply_agency",
          "view_agency",
          "manage_password",
          "update_password",
          "manage_agencies",
          "application_status",
          "manage_customers",
          "manage_staff",
          "manage_delivery_staff",
          "view_reports",
          "approve_connections",
          "view_customers",
          "update_profile",
          "manage_application",
          "view_delivery_staff_application",
          "update_delivery_staff_application",
          "pending_delivery_staff_application",
          "view_dileverystaff_application",
          "view_booking"
        ];
        break;
      case "Agency":
        this.permissions = [
          "manage_customers",
          "manage_staff",        "view_all_booking",
          "view_agency",
          "view_agency_reports",
          "update_password",
          "application_status",
          "approve_connections",
          "manage_inventory",
          "manage_delivery_staff",
          "manage_application",
          "view_customers",
          "update_profile",
          "view_delivery_staff_application",
          "update_delivery_staff_application",
          "pending_delivery_staff_application",
          "view_dileverystaff_application",
          "view_booking"
        ];
        break;
      case "Deliverystaff":
        this.permissions = [
          "view_deliveries",
          "update_delivery_status",
          "update_password",
          "view_customer_details",
          "update_profile",
          "view_dileverystaff_application",
          "view_booking"
        ];
        break;
      case "Customer":
        this.permissions = [
          "book_cylinder",
          "view_connection_details",
          "update_password",
          "update_profile",
          "view_booking"
        ];
        break;
      case "User":
        this.permissions = [
          "apply_connection",
          "apply_agency",
          "update_profile",
          "update_password",
          "application_status",
          "view_dileverystaff_application"
        ];
        break;
      default:
        this.permissions = [];
    }
  }

  next();
});

// Method to verify password
UserSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.Password);
};

// Export the model, preventing redefinition
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);