const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recurringSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, required: true }, 
    noOfEquip: { type: Number, required: true },
    employee: [{
        designation: { type: String, required: true },
        noOfEmployees: { type: Number, required: true },
        Emoluments: { type: Number, required: true },
        total: { type: Number, required: true }
    }]
});

module.exports = mongoose.model("RecurringTable", recurringSchema);
