const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  bot: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bot', 
    required: true 
  },
  currentStep: { 
    type: Number, 
    default: 0 // 0 = welcome, 1..N = question indices
  },
  responses: [{
    question: String,
    answer: String
  }],
  completed: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);