const mongoose = require("mongoose");

const UCRequestSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    type: { type: String, enum: ["recurring", "nonRecurring"] },
    ucData: Object,
    piSignature: { type: String, default: "null" },
    instituteStamp: { type: String, default: "null" },
    authSignature: { type: String, default: "null" },
    status: { type: String, enum: ["pending", "pendingAuthSign", "approvedByAuth", "approvedByInst", "pendingAdminApproval", "approvedByAdmin", "rejectedByAdmin"], default: "pending" },
    submissionDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UCRequest", UCRequestSchema);
