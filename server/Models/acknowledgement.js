const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const acknowledgementSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
    TCaccepted:{type:Boolean,required:true},
    acknowledged_at:{type:Date}
});

module.exports = mongoose.model("Acknowledgement", acknowledgementSchema);
