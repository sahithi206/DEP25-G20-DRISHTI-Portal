const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const budgetSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
    recurring_total: { type: Number, required: true },
    non_recurring_total: { type: Number, required: true },
    total: { type: Number, required: true }
});


module.exports = mongoose.model("Budget", budgetSchema);
