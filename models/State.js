const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    stateName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("States", stateSchema);
