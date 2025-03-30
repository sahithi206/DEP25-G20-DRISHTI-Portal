const mongoose = require("mongoose");

const UCCommentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  ucType: {
    type: String,
    enum: ["recurring", "nonRecurring"],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", 
    required: true,
  },
  role: {
    type: String,
    enum: ["PI", "Institute"], 
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UCComment", UCCommentSchema);