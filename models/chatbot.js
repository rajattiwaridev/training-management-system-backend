const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const MessageType = new Schema({
  type: { type: String, default: null },
  message: { type: String, default: null },
});

// Main Schema
const ChatBotSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    triggeredCount: {
      type: Number,
      default: 0,
    },
    invalidTriggeredCount: {
      type: Number,
      default: 0,
    },
    welcomeMessage: {
      type: MessageType,
      default: null,
    },
    invalidOptionMessage: {
      type: MessageType,
      default: null,
    },
    transferDefaultTeamMessage: {
      type: MessageType,
      default: null,
    },
    couldNotUnderStandMessage: {
      type: MessageType,
      default: null,
    },
    invalidCountTolerance: {
      type: Number,
      default: 5,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    systemGenerated: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isParent: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: String,
      default: null,
    },
    responseWelcomeMessage: [
      {
        type: MessageType,
        default: [],
      },
    ],
    optionType: {
      type: String,
      enum: ["TEXT", "LIST", "BUTTON"],
      default: "BUTTON",
    },
    listTitle: {
      type: String,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    encodeString: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "chatBot",
  }
);

// Indexes

// ChatBotSchema.index({ active: 1 });
// ChatBotSchema.index({ isDefault: 1 });
// ChatBotSchema.index({ isParent: 1 });
// ChatBotSchema.index({ groupId: 1 });
// ChatBotSchema.index({ isParent: 1, deleted: 1 });
// ChatBotSchema.index({ groupId: 1, name: 1 });
// ChatBotSchema.index({ isParent: 1, name: 1 });
// ChatBotSchema.index({ encodeString: 1 });
// ChatBotSchema.index({ isParent: 1, deleted: 1 });

module.exports = mongoose.model("chatBot", ChatBotSchema);
