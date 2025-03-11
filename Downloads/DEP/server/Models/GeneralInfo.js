const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const generalInfoSchema = new Schema({
    instituteName: { type: String, required: true },
    coordinator: { type: String, required: true },
    areaOfSpecialization: { type: String, required: true },
    scheme: { type: String},
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true }

});

module.exports = mongoose.model("GeneralInfo", generalInfoSchema);
