const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const piSchema = new Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    institute: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    noOfDBTProjects: { type: Number, required: true },
    noOfProjects: { type: Number, required: true },
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true }
});

module.exports = mongoose.model("PI", piSchema);
