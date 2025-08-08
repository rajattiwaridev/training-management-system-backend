const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to user collection
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    logoutTime: {
      type: Date,
    },
    token: {
      type: String,
      required: true,
    },
    //   ipAddress: {
    //     type: String,
    //   },
    //   deviceInfo: {
    //     os: String,
    //     browser: String,
    //     userAgent: String,
    //   },
    //   location: {
    //     city: String,
    //     state: String,
    //     country: String,
    //     lat: Number,
    //     lon: Number,
    //   },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "CLOSED"],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("login-logs", loginLogSchema);
