const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recurringSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, required: true },
    human_resources: [{
        designation: { type: String, required: true },
        noOfEmployees: { type: Number, required: true },
        Emoluments: { type: Number, required: true },
        Duration:{ type: Number, required: true },
        total: { type: Number, required: true }
    }],
    travel: { type: Number, required: true },
    consumables: [{
        item: { type: String, required: true },
        quantity: { type: Number, required: true },
        perUnitCost: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    others: [{
        description: { type: String, required: true },
        amount: { type: Number, required: true }
    }]
});

module.exports = mongoose.model("Recurring", recurringSchema);
