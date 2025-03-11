const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nonRecurringSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, required: true },
    items: [{
        item: { type: String, required: true },
        UnitCost: { type: Number, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true }
    }]
});


module.exports = mongoose.model("NonRecurring", nonRecurringSchema);
