const express = require("express");
const { fetchUser } = require("../Middlewares/fetchUser");
const { fetchAdmin } = require("../MiddleWares/fetchAdmin");
const GeneralInfo = require("../Models/General_Info");
const ResearchDetails = require("../Models/researchDetails");
const Budget = require("../Models/Budget");
const Recurring = require("../Models/Recurring");
const Bank = require("../Models/bankDetails.js");
const bankDetails = require("../Models/bankDetails");
const Acknowledgement = require("../Models/acknowledgement");
const Proposal = require("../Models/Proposal");
const Auth = require("./auth.js");
const User = require("../Models/user");
const Admin = require("../Models/Admin");
const Schemes = require("../Models/Scheme");
const PI = require("../Models/PI");
const router = express.Router();
const YearlyData= require("../Models/YearlyData");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const NonRecurring = require("../Models/NonRecurring");
const budgetSanctioned = require("../Models/budgetSanctioned.js");
const Scheme = require("../Models/Scheme");
const acknowledgement = require("../Models/acknowledgement");
const Project= require("../Models/Project.js")
const { ObjectId } = require("mongodb");


router.get("/approvedProposals", fetchAdmin, async (req, res) => {
  try {
    const userId = req.admin.id;
    console.log("User ID from Token:", userId);
    const Schemes=await Scheme.find({coordinator:userId});
    console.log(Schemes);
    if(!Schemes){
        return res.status(400).json({success:false,msg:"No Schemes found"});
    }
    const schemeIds = Schemes.map(scheme => scheme._id);
    const proposals = await Proposal.find({ Scheme: { $in: schemeIds }, status: "Approved" });    
    console.log("Fetched Proposals:", proposals);
    if (!proposals.length) {
      return res.status(400).json({ success: false, msg: "No proposals found" });
    }

     const data = await Promise.all(
          proposals.map(async (proposal) => {
            const generalInfo = await GeneralInfo.findOne({ proposalId: proposal._id });
            const researchDetails = await ResearchDetails.findOne({ proposalId: proposal._id });
            const bankInfo = await Bank.findOne({ proposalId: proposal._id });
            const user = await User.findOne({ _id: proposal.userId });
            const totalBudget = await Budget.findOne({ proposalId: proposal._id });
            const piInfo = await PI.findOne({ proposalId: proposal._id });
    
            return { proposal, generalInfo, researchDetails, bankInfo, user, totalBudget, piInfo };
          })
        );

    console.log("Final Data:", data);
    res.json({ success: true, msg: "Projects Fetched", data });

  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ success: false, msg: "Failed to Fetch Projects", error: "Internal Server Error" });
  }
});

router.get("/approvedProposal/:id", fetchAdmin, async (req, res) => {
    const {id}=req.params;
    try {
      const userId = req.admin.id;
      console.log("User ID from Token:", userId);
      const proposals = await Proposal.findById(id);    
      console.log("Fetched Proposals:", proposals);
      if (!proposals) {
        return res.status(400).json({ success: false, msg: "Proposal Not found" });
      }
    console.log(id);
      const researchDetails=await ResearchDetails.findOne({proposalId:id}).select("Title");
      const budget=await Budget.findOne({proposalId:id});
      console.log(budget);
      if(!budget){
        return res.status(400).json({ success: false, msg: "Proposal Not found" });
      }
      res.json({ success: true, msg: "Projects Fetched", budget,researchDetails });
  
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ success: false, msg: "Failed to Fetch Projects", error: "Internal Server Error" });
    }
  });

router.put("/allocate-budget/:id", fetchAdmin, async (req, res) => {
    const {id}=req.params;
    try {
      const budgetCheck= await budgetSanctioned.findOne({proposalId:id});
      const generalInfo = await GeneralInfo.findOne({ proposalId:id }).select("email");
      const users=await User.findOne({email:generalInfo.email}).select("_id");
      const projectCheck= await Project.findOne({userId:users._id});
      let budgetId;
      if(budgetCheck&&projectCheck){
        return res.status(400).json({ success: false, msg: "Budget Already Allocated!!" });
      }
      if(!budgetCheck){
        const proposal = await Proposal.findByIdAndUpdate({_id:id},{status:req.body.status},{new:true});    
        console.log("Fetched Proposals:", proposal);
        if (!proposal) {
          return res.status(400).json({ success: false, msg: "No proposals found" });
        }
        const budgetsanctioned=new budgetSanctioned({
          proposalId: id,
          budgetSanctioned: req.body.budgetsanctioned,
          budgetTotal: req.body.budgettotal,
          TotalCost: req.body.TotalCost,
        })
        await budgetsanctioned.save();
        console.log(budgetsanctioned);
        budgetId=new ObjectId(budgetsanctioned._id);
        console.log("Final Data:", budgetsanctioned);
      }
      if(!projectCheck){
        const project = await fetch(`${process.env.local}admin/createProject/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const changed_project= await project.json();
        console.log("Project Created",changed_project);
        if(!changed_project.success){
          const budget= await budgetSanctioned.findByIdAndDelete(budgetId);
          const proposals=await Proposal.findByIdAndUpdate({_id:id},{status:"Approved"},{new:true});
          const project=await Project.findByIdAndDelete(changed_project?._id);
        }
        res.json({ success: true, msg: "Project budget Allocated!!",project });
      }
    
    } catch (error) {
      console.error("Error fetching proposal:", error);
      res.status(500).json({ success: false, msg: "Failed to Fetch Project", error: "Internal Server Error" });
    }
  });

  router.post("/createProject/:proposalId", async (req, res) => {
      const { proposalId } = req.params;
      try {
         
          const proposal = await Proposal.findById(proposalId);
          console.log("Fetched Proposals:", proposal);
          
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
          const generalInfo = await GeneralInfo.findOne({ proposalId: proposal._id });
          const bankDetailsId = await bankDetails.findOne({ proposalId: proposal._id }).select("_id");
          const researchDetails = await ResearchDetails.findOne({ proposalId: proposal._id });
          const budgetsanctioned = await budgetSanctioned.findOne({ proposalId: proposalId }).select("TotalCost budgetSanctioned budgetTotal");
          const user1 = await User.findOne({email:generalInfo.email,Institute:generalInfo.instituteName});
          if(!user1){
            return res.status(400).json({success:false,msg:"Cannot Find User"});
          }
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
          const calculatedEndDate = new Date(new Date().setMonth(new Date().getMonth() + durationMonths)).toISOString().split('T')[0];
          console.log(parseFloat(researchDetails.Duration) / 12);
          console.log(budgetsanctioned.budgetTotal);
          const project = new Project({
              userId:user1._id,
              Scheme: proposal.Scheme,
              Title: researchDetails.Title,
              PI: PIS,
              CoPI: coPIS,
              years: parseFloat(researchDetails.Duration) / 12,
              currentYear: 1,
              startDate: new Date(),
              TotalCost: budgetsanctioned.TotalCost,
              TotalUsed:0,
              CarryForward:{
                overhead:0,
                nonRecurring:0,
                recurring:{
                    human_resources:0,
                    travel:0,
                    consumables:0,
                    others:0,
                    total:0
                },
                yearTotal:0,
            },
              budgetTotal:budgetsanctioned.budgetTotal,
              endDate: calculatedEndDate,
              generalInfoId: generalInfoId,
              bankDetailsId: bankDetailsId,
              researchDetailsId: researchDetails._id,
              PIDetailsId: Principal._id,
          });
          const projectCheck = await Project.findOne({ userId: user1._id, Scheme: proposal.Scheme });
          if (projectCheck) {
              return res.status(400).json({ success: false, msg: "A project Under this Scheme has already been Sanctioned" })
          }
  
          await project.save();
          const yearlyBudget = new YearlyData({
              projectId: project._id,
              budgetUnspent:0,
              budgetSanctioned: budgetsanctioned.budgetSanctioned
          })
          const budgetCheck = await YearlyData.findOne({ projectId: project._id });
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
          const user = await User.findByIdAndUpdate(user1._id, {
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


module.exports = router;
