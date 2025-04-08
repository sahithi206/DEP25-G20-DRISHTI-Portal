// models/UCModel.js
const mongoose = require("mongoose");

const UCSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        type: {
            type: String,
            enum: ["recurring", "nonRecurring"],
            required: true,
        },
        status: {
            type: String,
            enum: ["draft", "pendingInstituteApproval", "instituteApproved", "pendingAdminApproval", "adminApproved", "rejected"],
            default: "draft",
        },
        ucData: {
            instituteName: String,
            principalInvestigator: String,
            title: String,
            scheme: String,
            currentYear: String,
            CarryForward: Number,
            recurringExp: Number,
            human_resources: Number,
            consumables: Number,
            others: Number,
        },
        piSignature: String, // base64 string of the signature
        instituteSignature: String, // base64 string of the signature
        instituteStamp: String, // base64 string of the stamp
        adminSignature: String, // base64 string of the signature
        approvalTimeline: [
            {
                status: String,
                date: {
                    type: Date,
                    default: Date.now,
                },
                approvedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                comments: String,
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("UtilizationCertificate", UCSchema);