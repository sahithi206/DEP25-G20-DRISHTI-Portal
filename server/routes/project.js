const express = require("express");
const { fetchUser } = require("../Middlewares/fetchUser");
const Proposal = require("../Models/Proposal");
const GeneralInfo = require("../Models/General_Info");
const ResearchDetails = require("../Models/researchDetails");
const Budget = require("../Models/Budget");
const Recurring = require("../Models/Recurring");
const NonRecurring = require("../Models/NonRecurring");
const Bank = require("../Models/bankDetails.js");
const Acknowledgement = require("../Models/acknowledgement");
const Auth = require("./auth.js");
const User = require("../Models/user");
const router = express.Router();
const nodemailer = require("nodemailer");
const Project = require("../Models/Project.js");
const PI = require("../Models/PI");
const bankDetails = require("../Models/bankDetails.js");
const budgetSanctioned = require("../Models/budgetSanctioned.js");
const YearlyData = require("../Models/YearlyData.js");

router.post("/createProject/:proposalId", fetchUser, async (req, res) => {
    const { proposalId } = req.params;
    const { startDate } = req.body;
    const userId=req.user._id;
    try {
        if (!startDate || isNaN(new Date(startDate))) {
            return res.status(400).json({ success: false, msg: "Invalid start date" });
        }
        if (new Date(startDate) - new Date() < 5 * 24 * 60 * 60 * 1000) {
            return res.status(400).json({ success: false, msg: "Please Select Valid Date" });
        }
        const proposal = await Proposal.findById(proposalId);
        console.log("Fetched Proposals:", proposal);
        if (!proposal || proposal.status !== 'Approved') {
            return res.status(400).json({ success: false, msg: "No Approved proposal found" });
        }

        const Principal = await PI.findOne({ proposalId: proposal._id });
        if (!Principal) {
            return res.status(404).json({ success: false, msg: "No Principal Investigatoe details found" });
        }
        const PIS = Principal.piList ? Principal.piList.map(pi => {
            return pi.Name
        }) : [];
        const coPIS = Principal.coPiList ? Principal.coPiList.map(pi => {
            return pi.Name
        }) : [];
        const generalInfoId = await GeneralInfo.findOne({ proposalId: proposal._id }).select("_id");
        const bankDetailsId = await bankDetails.findOne({ proposalId: proposal._id }).select("_id");
        const researchDetails = await ResearchDetails.findOne({ proposalId: proposal._id });
        const budgetsanctioned = await budgetSanctioned.findOne({ proposalId: proposalId }).select("TotalCost budgetSanctioned");
        console.log(budgetsanctioned);
        if (!generalInfoId || !bankDetailsId || !researchDetails || !budgetsanctioned) {
            return res.status(404).json({ success: false, msg: "Couldn't find Required Information" });
        }
        const durationMonths = parseInt(researchDetails.Duration, 10) || 0;
        if(durationMonths===0){
            return res.status(400).json({succes:false,msg:"Duration Time of the Project is not Valid"});
        }
        const calculatedEndDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + durationMonths)).toISOString().split('T')[0];
        console.log(parseFloat(researchDetails.Duration) / 12); 
        const project = new Project({
            userId: req.user._id,
            Scheme: proposal.Scheme,
            Title: researchDetails.Title,
            PI: PIS,
            CoPI: coPIS,
            years: parseFloat(researchDetails.Duration) / 12,
            currentYear: 1,
            startDate: startDate,
            TotalCost: budgetsanctioned.TotalCost,
            endDate: calculatedEndDate,
            generalInfoId: generalInfoId,
            bankDetailsId: bankDetailsId,
            researchDetailsId: researchDetails._id,
            PIDetailsId: Principal._id,
        });
        const projectCheck = await Project.findOne({userId:userId,Scheme:proposal.Scheme});
        if(projectCheck){
            return res.status(400).json({success:false,msg:"A project Under this Scheme has already been Sanctioned"})
        }
        await project.save();
        const yearlyBudget = new YearlyData({
            projectId: project._id,
            budgetSanctioned: budgetsanctioned.budgetSanctioned
        })
        const budgetCheck = await YearlyData.findOne({projectId:project._id});
        if(budgetCheck){
            return res.status(400).json({success:false,msg:"A budget Under this Scheme has already been allocated"})
        }
        await yearlyBudget.save();
        const projectUpdated = await Project.findByIdAndUpdate(project._id, { $push: { YearlyDataId: yearlyBudget._id } }, { new: true });
        console.log("YearlyBudget", projectUpdated);
        if (!projectUpdated) {
            return res.status(400).json({ success: false, msg: "Failed to update project with yearly budget" });
        }
        res.json({ success: true, msg: "Project Created", projectUpdated });
    } catch (error) {
        console.error("Error fetching proposals:", error);
        res.status(500).json({ success: false, msg: "Failed to Fetch Projects", error: "Internal Server Error" });
    }
});


module.exports = router;