const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const researchDetailsSchema = new Schema({
    Title: { type: String, required: true },
    Duration: { type: Number, required: true },
    Summary: { type: String, required: true },
    objectives: [{ type: String, required: true }],
    Output: { type: String, required: true },
    other: { type: String },
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true }
});

module.exports = mongoose.model("ResearchDetails", researchDetailsSchema);
