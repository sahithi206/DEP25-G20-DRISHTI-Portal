const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otherExpensesSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, required: true },
    noOfEquip: { type: Number, default: 0 },
    expense: [{
        description: { type: String, required: true },
        amount: { type: Number, required: true }
    }]
});

module.exports = mongoose.model("OtherExpenses", otherExpensesSchema);
