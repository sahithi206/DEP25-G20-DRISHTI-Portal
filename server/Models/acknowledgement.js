const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const acknowledgementSchema = new Schema({
<<<<<<< HEAD
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
    TCaccepted:{type:Boolean,required:true},
    acknowledged_at:{type:Date}
=======
    proposalId: {
        type: Schema.Types.ObjectId,
        ref: "Proposal",
        required: true,
        index: true
    },
    generalInfoId: {
        type: Schema.Types.ObjectId,
        ref: "GeneralInfo",
        required: true
    },
    researchDetailsId: {
        type: Schema.Types.ObjectId,
        ref: "ResearchDetails",
        required: true
    },
    budgetSummaryId: {
        type: Schema.Types.ObjectId,
        ref: "BudgetSummary",
        required: true
    },
    bankDetailsId: {
        type: Schema.Types.ObjectId,
        ref: "BankDetails",
        required: true
    },
    PIdetailsId: {
        type: Schema.Types.ObjectId,
        ref: "PIdetails",
        required: true
    },
    TCaccepted: { type: Boolean, required: true },
    acknowledged_at: { type: Date, default: Date.now }
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
});

module.exports = mongoose.model("Acknowledgement", acknowledgementSchema);
