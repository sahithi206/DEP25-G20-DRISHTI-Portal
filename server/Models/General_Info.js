const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const generalInfoSchema = new Schema({
    proposalId: { type: String, required: true, unique: true }, 
    name: { type: String, required: true },
    address: { type: String, required: true },
    mobileNo: { type: String, required: true },
    email: { type: String, required: true},
    instituteName: { type: String, required: true },
    areaOfSpecialization: { type: String, required: true },
    DBTproj_ong: { type: Number, default: 0 }, 
    DBTproj_completed: { type: Number, default: 0 },
    Proj_ong: { type: Number, default: 0 },
    Proj_completed: { type: Number, default: 0 },
    biodata: { type: String }, 
    photo: { type: String}
}, { timestamps: true });
module.exports = mongoose.model("GeneralInfo", generalInfoSchema);
