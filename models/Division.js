const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema(
  {
    divisionCode: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "States", // 👈 This creates the relationship
      required: true,
    },
  },
  {
    timestamps: true, // automatically handles createdAt & updatedAt
  }
);

module.exports = mongoose.model("Division", divisionSchema);
