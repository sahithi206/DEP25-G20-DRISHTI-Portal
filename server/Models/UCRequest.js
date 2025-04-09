// models/UcRequest.js
import mongoose from "mongoose";

const UcRequestSchema = new mongoose.Schema({
    projectId: String,
    type: { type: String, enum: ["recurring", "nonRecurring"] },
    ucData: Object,
    piSignature: String,
    instituteStamp: String,
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    submissionDate: { type: Date, default: Date.now },
    approvalDate: Date
});

export default mongoose.model("UcRequest", UcRequestSchema);
