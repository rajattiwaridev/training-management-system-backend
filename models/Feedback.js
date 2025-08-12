// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Training',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  trainerRating: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  contentRating: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  suggestions: String,
  submittedAt: {
    type: Date,
  },
  status: {
    type: Boolean,
    default: false // false means not submitted, true means submitted
  },
  token:{
    type: String,
    required: true,
    unique: true
  },
  feedbackLink: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);