// utils/createAdminIfNotExists.js

const User = require("../Models/UserModel");

const createAdminIfNotExists = async () => {
  try {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || "SuperAdmin@nws.com";
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin2050";
    const existingAdmin = await User.findOne({ EmailId: adminEmail });

    if (!existingAdmin) {
      await User.create({
        Username: "SuperAdmin",
        EmailId: adminEmail,
        Password: adminPassword, // Will be hashed via Mongoose pre-save
        MobileNumber: "9999999999",
        Role: "Admin",
      });
    }
  } catch (error) {
    console.error("❌ Error creating SuperAdmin:", error.message);
  }
};

module.exports = createAdminIfNotExists;
