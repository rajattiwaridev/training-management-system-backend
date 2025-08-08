const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Training title is required"],
      trim: true,
    },
    trainerName: {
      type: String,
      required: [true, "Trainer name is required"],
      trim: true,
    },
    trainingType: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      default: "online",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Training date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      validate: {
        validator: function (endTime) {
          return this.startTime < endTime;
        },
        message: "End time must be after start time",
      },
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "postponed"],
      default: "scheduled",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
    },
    attendanceLink: {
      type: String,
    },
    qrCodeImg: {
      type: String,
    },
    attendanceCount:{
      type:  Number
    },
    photos: [{
      type: String,
    }],
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Update the updatedAt field before saving
trainingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Training = mongoose.model("Training", trainingSchema);

module.exports = Training;
