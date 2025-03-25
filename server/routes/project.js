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
const {ObjectId}=require("mongodb");
const  RecurringUC = require("../Models/UcRecurring.js");
const NonRecurringUC  = require("../Models/UcNonrecurring.js");
const SE =require("../Models/se/SE.js");
const Report = require("../Models/progressReport.js");
router.post("/createProject/:proposalId", fetchUser, async (req, res) => {
    const { proposalId } = req.params;
    const userId = req.user._id;
    try {
       
        const proposal = await Proposal.findById(proposalId);
        console.log("Fetched Proposals:", proposal);
        console.log(3);
        
        if (!proposal || proposal.status !== 'Sanctioned') {
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
        const budgetsanctioned = await budgetSanctioned.findOne({ proposalId: proposalId }).select("TotalCost budgetSanctioned budgetTotal");
        console.log(budgetsanctioned);
        if(!budgetsanctioned){
            return res.status(404).json({ success: false, msg: "Budget wasn't allocated!!" });
        }
        if (!generalInfoId || !bankDetailsId || !researchDetails || !budgetsanctioned) {
            return res.status(404).json({ success: false, msg: "Couldn't find Required Information" });
        }
        const durationMonths = parseInt(researchDetails.Duration, 10) || 0;
        if (durationMonths === 0) {
            return res.status(400).json({ succes: false, msg: "Duration Time of the Project is not Valid" });
        }
        const calculatedEndDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + durationMonths)).toISOString().split('T')[0];
        console.log(parseFloat(researchDetails.Duration) / 12);
        console.log(budgetsanctioned.budgetTotal);
        const project = new Project({
            userId: req.user._id,
            Scheme: proposal.Scheme,
            Title: researchDetails.Title,
            PI: PIS,
            CoPI: coPIS,
            years: parseFloat(researchDetails.Duration) / 12,
            currentYear: 1,
            startDate: new Date(),
            TotalCost: budgetsanctioned.TotalCost,
            TotalUsed:0,
            budgetTotal:budgetsanctioned.budgetTotal,
            endDate: calculatedEndDate,
            generalInfoId: generalInfoId,
            bankDetailsId: bankDetailsId,
            researchDetailsId: researchDetails._id,
            PIDetailsId: Principal._id,
        });
        const projectCheck = await Project.findOne({ userId: userId, Scheme: proposal.Scheme });
        console.log(5);
        if (projectCheck) {
            return res.status(400).json({ success: false, msg: "A project Under this Scheme has already been Sanctioned" })
        }
        console.log(6);

        await project.save();
        const yearlyBudget = new YearlyData({
            projectId: project._id,
            budgetUnspent:0,
            budgetSanctioned: budgetsanctioned.budgetSanctioned
        })
        const budgetCheck = await YearlyData.findOne({ projectId: project._id });
        console.log(7);
        if (budgetCheck) {
            return res.status(400).json({ success: false, msg: "A budget Under this Scheme has already been allocated" })
        }
        await yearlyBudget.save();
        const projectUpdated = await Project.findByIdAndUpdate(project._id, { $push: { YearlyDataId: yearlyBudget._id } }, { new: true });
        console.log("YearlyBudget", projectUpdated);
        console.log(8);
        if (!projectUpdated) {
            return res.status(400).json({ success: false, msg: "Failed to update project with yearly budget" });
        }
        const user = await User.findByIdAndUpdate(userId, {
            $push: { proposals: project._id }
        },
            { new: true }
        );
        const proposal1 = await Proposal.findByIdAndUpdate(proposalId,{status:"Sanctioned"},{new:true});
        res.json({ success: true, msg: "Project Created", projectUpdated });
    } catch (error) {
        console.error("Error fetching proposals:", error);
        res.status(500).json({ success: false, msg: "Failed to Fetch Projects", error: "Internal Server Error" });
    }
});

router.get("/get-projects", fetchUser, async (req, res) => {
    try {
        const projects = await Project.find({userId:req.user._id});
        if (projects.length<=0) {
            return res.status(200).json({ success: false, msg: "No Sanctioned Projects" })
        }
        return res.status(200).json({
            success: true, msg: "Sanctioned Projects Fetched Successfully",
            projects
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, msg: "Failed to Fetch Project", error: "Internal Server Error" });
    }
})

router.get("/get-project/:projectid", fetchUser, async (req, res) => {
    try {
        let {projectid} = req.params;
        let id = new ObjectId(projectid);
        const project = await Project.findById(id);
        const ids= await Project.findById(id)
        .populate("generalInfoId researchDetailsId PIDetailsId YearlyDataId");
        console.log(project);
        const user = await User.findById(req.user._id).populate("proposals");
        const userProjects = user.proposals.filter(prop => prop && prop._id).map(prop => prop._id);
        if (!project) {
            return res.status(400).json({ success: false, msg: "Cannot Find Project" })
        }
        const generalInfo = await GeneralInfo.findById(ids.generalInfoId);
        const researchDetails = await ResearchDetails.findById(ids.researchDetailsId);
        const PIDetails = await PI.findById(ids.PIDetailsId);
        const yearlyExp = await Promise.all(
            ids.YearlyDataId.map(async (Id) => {
                const budget = await YearlyData.findById(Id);
                return budget ? budget.budgetUsed : null;
            })
        );
        const yearlySanct = await Promise.all(
            ids.YearlyDataId.map(async (Id) => {
                const budget = await YearlyData.findById(Id);
                return budget ? budget.budgetSanctioned.yearTotal : null;
            })
        );
        const budget = ids.YearlyDataId?.[project.currentYear - 1]?.budgetSanctioned || null;
        const budgetused = ids.YearlyDataId?.[project.currentYear - 1]?.budgetUsed || null;
        const budgetUnspent=ids.YearlyDataId?.[project.currentYear - 1]?.budgetUnspent || null;
        return res.status(200).json({
            success: true, msg: "Fetched Project's Details Successfully",
            project, generalInfo, researchDetails, PIDetails, budget,budgetused,budgetUnspent,yearlyExp,yearlySanct,
        })
    } catch (e) {
        console.log("ProjectError",e);
        return res.status(500).json({ success: false, msg: "Failed to Fetch Project Details", error: "Internal Server Error" });
    }
})

router.post("/uc/recurring/:id", fetchUser, async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ success:false,msg: "Missing data in request body" });
        }
        const prev= await RecurringUC.findOne({projectId:req.params.id,scheme:data.scheme,currentYear:data.currentYear});
        if(prev){
            return res.status(400).json({ success:false,msg: "Already Submitted for Current Financial Year" });
        }
        const newGrant = new RecurringUC({
            projectId: req.params.id,
            title: data.title,
            scheme: data.scheme,
            currentYear: data.currentYear,
            startDate: data.startDate,
            endDate: data.endDate,
            CarryForward: data.CarryForward,
            yearTotal: data.yearTotal,
            total: data.total,
            type:"recurring",
            recurringExp:data.recurring,
            humanResource: data.human_resources,
            consumables:data.consumables,
            others:data.others
        });
        console.log("ucrecurring",newGrant);
        await newGrant.save();
        res.status(201).json({success:true, msg: "Recurring Grant added successfully", grant: newGrant });
    } catch (error) {
        console.error("Error creating grant:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/uc/nonRecurring/:id", fetchUser, async (req, res) => {
    try {
        const { data } = req.body;
        console.log("data",data);
        if (!data) {
            return res.status(400).json({ error: "Missing data in request body" });
        }
        console.log("data",data);
        const prev= await NonRecurringUC.findOne({projectId:req.params.id,scheme:data.scheme,currentYear:data.currentYear});
        if(prev){
            return res.status(400).json({ success:false,msg: "Already Submitted for Current Financial Year" });
        }
        const newGrant = new NonRecurringUC({
            projectId: req.params.id,
            title: data.title,
            scheme: data.scheme,
            currentYear: data.currentYear,
            startDate: data.startDate,
            endDate: data.endDate,
            type:"nonRecurring",
            CarryForward: data.CarryForward,
            yearTotal: data.yearTotal,
            total: data.total,
                nonRecurringExp:data.nonRecurring,
        });

        await newGrant.save();
        res.status(201).json({success:true, msg: "Recurring Grant added successfully", grant: newGrant });
    } catch (error) {
        console.error("Error creating grant:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/ucforms/:id", fetchUser, async (req, res) => {
    try {
        const recurringgrant = await RecurringUC.find({projectId:req.params.id});
        const grant = await NonRecurringUC.find({projectId:req.params.id});
        const se = await SE.find({projectId:req.params.id});
        
        if (grant.length<=0&&recurringgrant.length<=0&&se.length<=0) {
            return res.status(404).json({ succes:false,msg: "Certificates not found" });
        }

        res.status(200).json({success:true,grant,se,recurringgrant,msg:"Certificates Fetched"});
    } catch (error) {
        console.error("Error fetching Certificates:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/ucforms/recurring/:id", fetchUser, async (req, res) => {
    try {
        const grant = await RecurringUC.findById(req.params.id);
        
        if (!grant) {
            return res.status(404).json({ succes:false,msg: "Utilization Certificate not found" });
        }
        res.status(200).json({success:true,grant,msg:"Utilization Certificate Details Fetched"});
    } catch (error) {
        console.error("Error fetching grant:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/ucforms/nonRecurring/:id", fetchUser, async (req, res) => {
    try {
        console.log(req.params.id);
        const {id}=req.params
        const grant = await NonRecurringUC.findById(id);
        console.log(grant);
        if (!grant) {
            return res.status(400).json({ succes:false,msg: "Utilization Certificate not found" });
        }
        res.status(200).json({success:true,grant,msg:"Utilization Certificate  Details Fetched"});
    } catch (error) {
        console.error("Error fetching grant:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/se",fetchUser,async(req,res)=>{
 try{
   const { data,yearlyBudget,budgetSanctioned,manpower,consumables,others,equipment,total,totalExp,balance } = req.body;
   if(!data||!yearlyBudget||!budgetSanctioned||!manpower||!consumables||!others||!equipment||!total||!totalExp||!balance){
    return res.status(400).json({ success:false,msg:"Fill all the Details" });
   }
      const seCheck= await SE.findOne({projectId:data.projectId,scheme:data.scheme,currentYear:data.currentYear});
      console.log(seCheck);
      if(seCheck){
        return res.status(400).json({success:false,msg:"Statement for Current Financial Year was already Submitted"})
      }
   const se= new SE({
      projectId:data.projectId,
      name:data.name,
      institute:data.institute,
        scheme:data.scheme,
        currentYear:data.currentYear,
        startDate:data.startDate,
        endDate:data.endDate,
        TotalCost:data.TotalCost,
        status:"Pending for institute approval.",
        yearlyBudget:yearlyBudget,
        budgetSanctioned:budgetSanctioned,
        human_resources:manpower,
        consumables:consumables,
        others:others,
        nonRecurring:equipment,
        total:total,
        totalExp:totalExp,
        balance:balance,
   });
   await se.save();

   res.status(200).json({success:true,msg:"Statement of Expenditure not Submitted",se});
 }
 catch(e){
    console.error("Error Submitting SE:", e);
        res.status(500).json({ error: "Internal Server Error" });
 }
})

router.get("/se/:id",fetchUser,async(req,res)=>{
    try{
       const {id}=req.params;
       const se=await SE.findById(id);
       if(!se){
         return res.status(400).json({success:false,msg:"Statement of Expenditure Not Found"})
       }
      res.status(200).json({success:true,msg:"Statement of Expenditure not Submitted",se});
    }
    catch(e){
       console.error("Error Fetching SE:", e);
           res.status(500).json({ error: "Internal Server Error" });
    }
   })

   router.post("/progress-report/:id", fetchUser, async (req, res) => {
    const { id } = req.params; 
    const { data } = req.body; 

    try {
        const formattedData = {
            ...data,
            approvedObjectives: Array.isArray(data.approvedObjectives)
                ? data.approvedObjectives.join("\n")
                : data.approvedObjectives,
            majorEquipment: Array.isArray(data.majorEquipment)
                ? data.majorEquipment
                : [data.majorEquipment] 
        };

        const progressReport = new Report({
            projectId: id,
            ...formattedData
        });

        await progressReport.save();
        res.status(201).json({ success: true, msg: "Progress report submitted successfully", data: progressReport });
    } catch (error) {
        console.error("Error submitting progress report:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});

router.get("/progress-report/:id", fetchUser, async (req, res) => {
    const { id } = req.params; 

    try {
        const progressReports = await Report.find({ projectId: id });
        res.status(200).json({ success: true, data: progressReports });
    } catch (error) {
        console.error("Error fetching progress reports:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
});
module.exports = router;