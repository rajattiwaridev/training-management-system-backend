const mongoose = require("mongoose");

const headerSchema = new mongoose.Schema(
  {
    headerTextOne: { type: String, required: true },
    headerTextOneHindi: { type: String, required: true },
    headerTextTwo: { type: String, required: true },
    headerTextTwoHindi: { type: String, required: true },
    status: {type: Boolean, default: true},
    logoLeft: {
      type: String,
    },
    logoRight: {
      type: String,
    },
  },
  {
    timestamps: true, // ✅ This adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("headers", headerSchema);
