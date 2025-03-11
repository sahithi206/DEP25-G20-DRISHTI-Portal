const mongoose = require("mongoose");

const FundCycleRequestSchema = new mongoose.Schema({
    applicantName: { type: String, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("FundCycleRequest", FundCycleRequestSchema);
