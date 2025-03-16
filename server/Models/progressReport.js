const mongoose = require('mongoose');

const progressReportSchema = new mongoose.Schema({
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    YearlyDataId: { type: Schema.Types.ObjectId, ref: "YearlyData", required: true },
    projectTitle: { type: String, required: true },
    principalInvestigator: [{ type: String, required: true }],
    coPrincipalInvestigator: [{ type: String, required: true }],
    researchArea: { type: String, required: true },
    approvedObjectives: { type: String, required: true },
    dateOfStart: { type: Date, required: true },
    totalProjectCost: { type: Number, required: true },
    dateOfCompletion: { type: Date, required: true },
    expenditureAsOn: { type: Number, required: true },
    methodology: { type: String, required: true },
    researchAchievements: {
        summaryOfProgress: { type: String, required: true },
        newObservations: { type: String },
        innovations: { type: String },
        applicationPotential: {
            longTerm: { type: String },
            immediate: { type: String }
        },
        otherAchievements: { type: String }
    },
    remainingWork: { type: String },
    phdProduced: { type: Number, default: 0 },
    technicalPersonnelTrained: { type: Number, default: 0 },
    researchPublications: {
        papersInCitedJournals: [{ title: String, authors: [String], journal: String, year: Number }],
        papersInConferences: [{ title: String, authors: [String], conference: String, year: Number }],
        patentsFiled: [{ title: String, filingDate: Date }]
    },
    majorEquipment: [{
        sanctionedList: { type: String },
        procured: { type: Boolean, required: true },
        modelMake: { type: String },
        cost: { type: Number },
        working: { type: Boolean, required: true },
        utilizationRate: { type: Number }
    }]
});

const ProgressReport = mongoose.model('Report', progressReportSchema);

module.exports = ProgressReport;
