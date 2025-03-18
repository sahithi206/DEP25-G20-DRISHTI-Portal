const mongoose = require("mongoose");

const RecurringGrantSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    scheme: { type: String, required: true },
    currentYear: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    CarryForward: { type: Number, required: true, default: 0 },
    yearTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    type:{type:String,required:true},
    recurringExp: { type: Number, required: true },
    humanResource: { type: Number, required: true, default: 0 },
    consumables: { type: Number, required: true, default: 0 },
    others: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: "Pending for institute approval." }, // change to submitted when institute approves
});
 

module.exports = mongoose.model("RecurringUC", RecurringGrantSchema);
