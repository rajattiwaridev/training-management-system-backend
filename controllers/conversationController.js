const Conversation = require('../models/Conversation');
const Bot = require('../models/Bot');

// Start conversation with menu options
exports.startConversation = async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.botId);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const conversation = new Conversation({ bot: bot._id });
    await conversation.save();

    const firstQuestion = bot.questions.sort((a, b) => a.order - b.order)[0];
    
    const response = {
      message: bot.welcomeMessage,
      nextQuestion: firstQuestion.text,
      type: firstQuestion.type,
      conversationId: conversation._id
    };

    // Add options if it's a menu question
    if (firstQuestion.type === 'menu') {
      response.options = firstQuestion.options.map(opt => ({
        text: opt.text,
        value: opt.value
      }));
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle reply with menu selection
exports.handleReply = async (req, res) => {
  try {
    const { answer } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);
    // ... existing validation

    const bot = await Bot.findById(conversation.bot);
    const sortedQuestions = bot.questions.sort((a, b) => a.order - b.order);
    const currentQuestion = sortedQuestions[conversation.currentStep];

    // Save answer
    conversation.responses.push({
      question: currentQuestion.text,
      answer,
      value: currentQuestion.type === 'menu' 
        ? currentQuestion.options.find(opt => opt.text === answer)?.value 
        : answer
    });

    // Move to next step
    conversation.currentStep += 1;

    // Check completion
    if (conversation.currentStep >= sortedQuestions.length) {
      conversation.completed = true;
      await conversation.save();
      return res.json({ message: 'Conversation completed!' });
    }

    // Prepare next question
    const nextQuestion = sortedQuestions[conversation.currentStep];
    const response = {
      nextQuestion: nextQuestion.text,
      type: nextQuestion.type
    };

    // Add options if it's a menu question
    if (nextQuestion.type === 'menu') {
      response.options = nextQuestion.options.map(opt => ({
        text: opt.text,
        value: opt.value
      }));
    }

    await conversation.save();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};