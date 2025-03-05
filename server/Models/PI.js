const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const piSchema = new Schema({
<<<<<<< HEAD
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
=======
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
    members:[{
        role:{type:String ,required:true},
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        mobileNo: { type: String, required: true },
        instituteName: { type: String, required: true },
        Dept: { type: String, required: true },
        DBTproj_ong: { type: Number, required: true },
        DBTproj_completed: { type: Number, required: true },
        Proj_ong :{ type: Number, required: true },
        Proj_completed: { type: Number, required: true }
    }]
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
});

module.exports = mongoose.model("PI", piSchema);
