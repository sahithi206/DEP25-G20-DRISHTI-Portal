const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const generalInfoSchema = new Schema({
    instituteName: { type: String, required: true },
    coordinator: { type: String, required: true },
    areaOfSpecialization: { type: String, required: true },
    scheme: { type: String, required: true },
    proposalId: { type:String, required: true }
});

module.exports = mongoose.model("GeneralInfo", generalInfoSchema);
