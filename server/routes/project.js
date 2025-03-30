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
            recurringExp:data.recurringExp,
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
            projectId: data.projectId,
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


router.get("/generate-uc/recurring/:id", fetchUser, async (req, res) => {
    console.log(" recurring uc generate ", req.params.id);
    try {
      const { id: projectId } = req.params;
  
      const project = await Project.findById(projectId).populate("YearlyDataId");
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
  
      const currentYearData = project.YearlyDataId[project.currentYear - 1];
      if (!currentYearData) {
        return res.status(404).json({ success: false, message: "Yearly data not found for the current year" });
      }
  
      const recurringUCData = {
        projectId: project._id,
        title: project.Title,
        scheme: project.Scheme,
        currentYear: project.currentYear,
        startDate: project.startDate,
        endDate: project.endDate,
        CarryForward: currentYearData.budgetUnspent,
        yearTotal: currentYearData.budgetSanctioned.yearTotal,
        total: currentYearData.budgetUnspent + currentYearData.budgetSanctioned.yearTotal,
        recurringExp: currentYearData.budgetUsed.recurring.total,
        human_resources: currentYearData.budgetUsed.recurring.human_resources,
        consumables: currentYearData.budgetUsed.recurring.consumables,
        others: currentYearData.budgetUsed.recurring.others,
      };
  
      res.status(200).json({ success: true, data: recurringUCData });
    } catch (error) {
      console.error("Error generating recurring UC:", error.message);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  });

  router.get("/generate-uc/nonRecurring/:id", fetchUser, async (req, res) => {
    try {
      const { id: projectId } = req.params;
  
      const project = await Project.findById(projectId).populate("YearlyDataId");
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
  
      const currentYearData = project.YearlyDataId[project.currentYear - 1];
      if (!currentYearData) {
        return res.status(404).json({ success: false, message: "Yearly data not found for the current year" });
      }
  
      const nonRecurringUCData = {
        projectId: project._id,
        title: project.Title,
        scheme: project.Scheme,
        currentYear: project.currentYear,
        startDate: project.startDate,
        endDate: project.endDate,
        CarryForward: currentYearData.budgetUnspent,
        yearTotal: currentYearData.budgetSanctioned.yearTotal,
        total: currentYearData.budgetUnspent + currentYearData.budgetSanctioned.yearTotal,
        nonRecurringExp: currentYearData.budgetUsed.nonRecurring,
      };
  
      res.status(200).json({ success: true, data: nonRecurringUCData });
    } catch (error) {
      console.error("Error generating non-recurring UC:", error.message);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  });
module.exports = router;