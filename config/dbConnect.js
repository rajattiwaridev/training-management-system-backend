const mongoose = require("mongoose");
const { registerUser } = require("../controllers/authController");

const dbConnect = async () => {
  try {
    const mongoUri = "mongodb://localhost:27017/cg-transport";

    await mongoose.connect(mongoUri);
    console.log("✅ Database Connected Successfully");

  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
  }
};

module.exports = dbConnect;
