const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  value: { type: String, required: true }
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  order: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['text', 'menu'], 
    default: 'text' 
  },
  options: [optionSchema]
});

const botSchema = new mongoose.Schema({
  name: { type: String, required: true },
  welcomeMessage: { type: String, required: true },
  questions: [questionSchema]
});

module.exports = mongoose.model('Bot', botSchema);