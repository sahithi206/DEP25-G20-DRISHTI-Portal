const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const generalInfoSchema = new Schema({
    proposalId: {type: Schema.Types.ObjectId, ref: "Proposal", required: true},
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    mobileNo: { type: String, required: true },
    instituteName: { type: String, required: true },
    coordinator: { type: String, required: true },
    areaOfSpecialization: { type: String, required: true },
    DBTproj_ong: { type: Number, required: true },
    DBTproj_completed: { type: Number, required: true },
    Proj_ong :{ type: Number, required: true },
    Proj_completed: { type: Number, required: true }
});

module.exports = mongoose.model("GeneralInfo", generalInfoSchema);


