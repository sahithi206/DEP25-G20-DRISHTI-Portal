const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const piSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
    members:[{
        role:{type:String ,required:true},
        email: { type: String, required: true },
        Name: { type: String, required: true },
        Institute: { type: String, required: true },
        DOB: { type: String, required: true },
        Mobile: { type: String, required: true },
        Gender: { type: String, required: true },
        address: { type: String, required: true },
        Dept: { type: String, required: true },
    }]
});

module.exports = mongoose.model("PI", piSchema);
/*  DBTproj_ong: { type: Number, required: true },
        DBTproj_completed: { type: Number, required: true },
        Proj_ong :{ type: Number, required: true },
        Proj_completed: { type: Number, required: true }*/
