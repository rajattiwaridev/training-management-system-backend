const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageType = new Schema({
  type: { type: String, default: null },
  message: { type: String, default: null },
});

// Main schema
const ChatBotOptionSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
    },
    message: {
      type: MessageType,
      default: null,
    },
    key: {
      type: String,
      required: true,
    },
    keyIndex: {
      type: Number,
      required: true,
    },
    chatBot: {
      type: Schema.Types.ObjectId,
      ref: "chatBot",
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    triggeredCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "ChatBotOption",
  }
);

// Create indexes
ChatBotOptionSchema.index({ chatBot: 1 });
ChatBotOptionSchema.index({ chatBot: 1, deleted: 1 });

module.exports = mongoose.model("ChatBotOption", ChatBotOptionSchema);
