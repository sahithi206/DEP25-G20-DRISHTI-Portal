const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const budgetSummarySchema = new Schema({
    budgetId: { type: Schema.Types.ObjectId, ref: "Budget", required: true },
    nonRecurringTotal: { type: Number, required: true },
    recurringTotal: { type: Number, required: true },
    total: { type: Number, required: true }
});

module.exports = mongoose.model("BudgetSummary", budgetSummarySchema);
