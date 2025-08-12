const feedback = require("../models/Feedback");
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { token, trainerRating, contentRating, suggestions } = req.body;
    const feedbackDoc = await feedback.findOne({ token });
    if (!feedbackDoc) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    feedbackDoc.status = true;
    feedbackDoc.trainerRating = trainerRating;
    feedbackDoc.contentRating = contentRating;
    feedbackDoc.suggestions = suggestions || "";
    feedbackDoc.submittedAt = new Date();
    await feedbackDoc.save();
    res
      .status(200)
      .json({ message: "Feedback status updated", feedback: feedbackDoc });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.checkFeedbackStatus = async (req, res) => {
  try {
    const { token } = req.query;
    const feedbackDoc = await feedback.findOne({ token });
    if (!feedbackDoc) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json({ status: feedbackDoc.status });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
