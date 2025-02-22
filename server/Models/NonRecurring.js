const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nonRecurringSchema = new Schema({
    budgetId: { type: Schema.Types.ObjectId, ref: "Budget", required: true }, 
    noOfEquip: { type: Number, required: true },
    items: [{
        UnitCost: { type: Number, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true } 
    }]
});

module.exports = mongoose.model("NonRecurring", nonRecurringSchema);
