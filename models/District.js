const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    sName: { type: String, required: true },
    districtName: { type: String, required: true },
    districtNameEng: { type: String, required: true },
    LGDCode: { type: Number, required: true, unique: true },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division", // 👈 This creates the relationship
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("District", districtSchema);
