const mongoose = require("mongoose");

const progressReportSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    type:{type:String, default:"Yearly"},
    projectTitle: String,
    currentYear: Number,
    principalInvestigator: [String],
    coPrincipalInvestigator: [String],
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
    ] 
});

const ProgressReport = mongoose.model("ProgressReport", progressReportSchema);

module.exports = ProgressReport;