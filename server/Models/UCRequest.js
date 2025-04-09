const mongoose = require("mongoose");

const UCRequestSchema = new mongoose.Schema({
    projectId: String,
    type: { type: String, enum: ["recurring", "nonRecurring"] },
    ucData: Object,
    piSignature: { type: String, default: "null" },
    instituteStamp: { type: String, default: "null" },
    status: { type: String, enum: ["pending", "approvedByInst", "approved", "pendingAdminApproval","approvedByAdmin", "rejectedByAdmin"], default: "pending" },
    submissionDate: { type: Date, default: Date.now },
    // approvalDate: Date
});

module.exports = mongoose.model("UCRequest", UCRequestSchema);
