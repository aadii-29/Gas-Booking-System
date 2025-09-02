const mongoose = require("mongoose");
const dotenv = require("dotenv");

const createAdminIfNotExists = require("../Utils/createAdminIfNotExists");
dotenv.config();
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`
    );

    // ✅ Safety logic: Only run in dev AND when explicitly allowed
    if (
      process.env.NODE_ENV === "development" &&
      process.env.ONLY_CREATE_ADMIN_IN_DEV === "true"
    ) {
      await createAdminIfNotExists();
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
