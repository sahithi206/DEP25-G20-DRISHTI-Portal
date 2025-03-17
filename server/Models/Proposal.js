const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const proposalSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    status: { type: String, enum: ["Unsaved","Pending","Sanctioned", "Approved", "Rejected"], required: true },
    Scheme:{type:String}
});

module.exports = mongoose.model("Proposal", proposalSchema);
