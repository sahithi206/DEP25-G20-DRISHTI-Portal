const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const proposalSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], required: true }
});

module.exports = mongoose.model("Proposal", proposalSchema);
