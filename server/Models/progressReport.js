const mongoose = require("mongoose");

const progressReportSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    type:{type:String, default:"Yearly"},
    projectTitle: String,
    currentYear: Number,
    principalInvestigator: [{ type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }],
    coPrincipalInvestigator: [{ type: mongoose.Schema.Types.ObjectId, ref: "users"}],
    researchArea: String,
    approvedObjectives: [String],
    dateOfStart: Date,
    totalProjectCost: Number,
    dateOfCompletion: Date,
    expenditureAsOn: Number,
    methodology: String,
    researchAchievements: {
        summaryOfProgress: String,
        newObservations: String,
        innovations: String,
        applicationPotential: { longTerm: String, immediate: String },
        otherAchievements: String
    },
    remainingWork: String,
    phdProduced: Number,
    technicalPersonnelTrained: Number,
    researchPublications: {
        papersInCitedJournals: [String],
        papersInConferences: [String],
        patentsFiled: [String]
    },
    majorEquipment: [
        { equipment:String,
         cost:Number, 
         working:String, 
         rate: String }
    ] ,
    read: { type: Boolean, default: false },
    date:{
        type:Date,
        default:new Date()
    }

});

// const ProgressReport = mongoose.model("ProgressReport", progressReportSchema);

module.exports = mongoose.model("ProgressReport", progressReportSchema, "progressreports");