const mongoose = require("mongoose");

const UCCommentSchema = new mongoose.Schema({
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Resolved", "Pending","Viewed"],
    default:"Pending",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comments", UCCommentSchema);