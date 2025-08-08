const ChatBot = require("../models/chatbot");

exports.createBot = async (req, res) => {
  try {
    const { name, ...otherFields } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Bot name is required" });
    }

    // Create new bot
    const newBot = new ChatBot({
      name,
      ...otherFields,
      // Force system-generated bots to be non-default
      ...(otherFields.systemGenerated && { isDefault: false })
    });

    // Save to database
    const savedBot = await newBot.save();
    
    res.status(201).json(savedBot);
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating bot",
      error: error.message 
    });
  }
};

exports.triggerBot = async (req, res) => {
  try {
    const { botId, isValid } = req.body;
    
    // Validate input
    if (!botId || typeof isValid !== "boolean") {
      return res.status(400).json({
        message: "botId and isValid (boolean) are required"
      });
    }

    // Handle valid trigger
    if (isValid) {
      const updatedBot = await ChatBot.findOneAndUpdate(
        { _id: botId, active: true },
        { $inc: { triggeredCount: 1 } },
        { new: true }
      );

      if (!updatedBot) {
        return res.status(404).json({
          message: "Bot not found or inactive"
        });
      }

      return res.json({
        message: "Bot triggered successfully",
        response: updatedBot.welcomeMessage,
        bot: updatedBot
      });
    } 
    // Handle invalid trigger
    else {
      const updatePipeline = [
        {
          $set: {
            invalidTriggeredCount: { $add: ["$invalidTriggeredCount", 1] },
            active: {
              $cond: {
                if: { 
                  $gte: [
                    { $add: ["$invalidTriggeredCount", 1] },
                    "$invalidCountTolerance"
                  ]
                },
                then: false,
                else: "$active"
              }
            }
          }
        }
      ];

      const updatedBot = await ChatBot.findOneAndUpdate(
        { _id: botId, active: true },
        updatePipeline,
        { new: true }
      );

      if (!updatedBot) {
        return res.status(404).json({
          message: "Bot not found or already inactive"
        });
      }

      return res.json({
        message: updatedBot.active ? 
          "Invalid trigger recorded" : 
          "Bot deactivated due to invalid triggers",
        response: updatedBot.couldNotUnderStandMessage,
        bot: updatedBot
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error triggering bot",
      error: error.message
    });
  }
};
