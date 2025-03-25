const mongoose = require("mongoose");

const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  eligibility: { type: String, required: true },
  budget: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  status: { type: String, enum: ["Active", "Inactive", "Completed"], default: "Active" },
});

module.exports = mongoose.model("Scheme", SchemeSchema);
