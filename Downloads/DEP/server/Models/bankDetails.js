const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bankDetailsSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
    name: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountType: { type: String, required: true },
    bankName: { type: String, required: true }
});

module.exports = mongoose.model("BankDetails", bankDetailsSchema);
