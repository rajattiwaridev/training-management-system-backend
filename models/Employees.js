const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'States',
    required: true
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    required: true
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  officerEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  designation: {
    type: String,
    enum: ['SRM', 'DRM'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  photo: {
    type: String, // URL to uploaded photo
    default: ''
  },
  postQualification: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  dateOfJoining: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  personalEmail: {
    type: String,
    lowercase: true
  },
  fatherName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Boolean,
    default: true
  },
  password: {
    type: String,
  },
  isPasswordReset: {
    type: Boolean,
    default: false,
  }
});

// Calculate age virtual property
employeeSchema.virtual('age').get(function() {
  const diff = Date.now() - this.dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

module.exports = mongoose.model('Employees', employeeSchema);