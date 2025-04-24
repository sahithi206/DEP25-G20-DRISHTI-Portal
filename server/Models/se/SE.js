const mongoose = require("mongoose");

const SESchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    institute: { type: String, required: true },
    scheme: { type: String, required: true },
    currentYear: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    TotalCost: { type: Number, required: true },
    yearlyBudget: [{ type: Number, default: 0 }],
    budgetSanctioned: {
        human_resources: { type: Number, default: 0 },
        consumables: { type: Number, default: 0 },
        travel: { type: Number, default: 0 },
        others: { type: Number, default: 0 },
        nonRecurring: { type: Number, default: 0 },
        overhead: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    human_resources: [{ type: Number, default: 0 }],
    consumables: [{ type: Number, default: 0 }],
    travel: [{ type: Number, default: 0 }],
    others: [{ type: Number, default: 0 }],
    nonRecurring: [{ type: Number, default: 0 }],
    total: [{ type: Number, default: 0 }],
    overhead: [{ type: Number, default: 0 }],
    totalExp: {
        human_resources: { type: Number, default: 0 },
        consumables: { type: Number, default: 0 },
        travel: { type: Number, default: 0 },
        others: { type: Number, default: 0 },
        nonRecurring: { type: Number, default: 0 },
        overhead: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    balance: {
        human_resources: { type: Number, default: 0 },
        consumables: { type: Number, default: 0 },
        travel: { type: Number, default: 0 },
        others: { type: Number, default: 0 },
        overhead: { type: Number, default: 0 },
        nonRecurring: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    piSignature: { type: String },
    instituteStamp: { type: String, default: "null" },
    authSignature: { type: String, default: "null" },
    status: {
        type: String,
        enum: [
            "pending",
            "pendingByAuth",
            "approvedByAuth",
            "approvedByInst",
            "pendingAdminApproval",
            "approvedByAdmin",
            "rejectedByAdmin",
        ],
        default: "pending",
    },
    date: {
        type: Date,
        dafault: new Date()
    }
});


module.exports = mongoose.model("SE", SESchema);
