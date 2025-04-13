const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    }],
    FormData: {
        piName: String,
        projectTitle: String,
        currentInstitute: String,
        currentInstituteAddress: String,
        state: String,
        district: String,
        newInstitute: String,
        department: String,
        designation: String,
        resignationDate: Date,
        joiningDate: Date,
        justification: String
    },
   
    status: {
        type: String,
        enum: ["Pending","Sent","Pending for Admin's Approval","Approved", "Rejected"],
        default: "Pending",
    },
    comment:{
        type: String,
        default:""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("InstituteRequest", RequestSchema);
