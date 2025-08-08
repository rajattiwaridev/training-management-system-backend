const Bot = require('../models/Bot');

exports.createBotNew = async (req, res) => {
  try {
    const { name, welcomeMessage, questions, menuOptions } = req.body;
    
    // Validate question order sequence
    const orders = questions.map(q => q.order);
    if (new Set(orders).size !== orders.length) {
      return res.status(400).json({ error: 'Question orders must be unique' });
    }

    // Validate and apply menu options
    const enhancedQuestions = questions.map((question, index) => {
      if (index === 0) {
        // Validate menu options structure
        if (!menuOptions || !Array.isArray(menuOptions)) {
          return res.status(400).json({ 
            error: 'Menu options must be provided as an array for the first question' 
          });
        }

        const isValidOptions = menuOptions.every(
          opt => opt.text && opt.value && typeof opt.text === 'string' && typeof opt.value === 'string'
        );
        
        if (!isValidOptions) {
          return res.status(400).json({ 
            error: 'Each menu option must have text and value as strings' 
          });
        }

        return {
          ...question,
          type: 'menu',
          options: menuOptions
        };
      }
      return question;
    });

    // If we got a response from validation, return it
    if (enhancedQuestions.some(q => q instanceof res.Response)) {
      return;
    }

    const bot = new Bot({ 
      name, 
      welcomeMessage, 
      questions: enhancedQuestions 
    });
    
    await bot.save();
    res.status(201).json(bot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bot details remains unchanged
exports.getBot = async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });
    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};