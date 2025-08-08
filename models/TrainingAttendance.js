const mongoose = require("mongoose");

const TraningAttendanceSchema = new mongoose.Schema(
  {
    trainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("training-attendance", TraningAttendanceSchema);
