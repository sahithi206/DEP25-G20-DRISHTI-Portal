const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const proposalSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    Scheme:{type:String,required:true},
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], required: true }
});

module.exports = mongoose.model("Proposal", proposalSchema);
