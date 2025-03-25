const express = require("express");
const { fetchUser } = require("../Middlewares/fetchUser");
const { fetchAdmin } = require("../MiddleWares/fetchAdmin");
const GeneralInfo = require("../Models/General_Info");
const ResearchDetails = require("../Models/researchDetails");
const Budget = require("../Models/Budget");
const Recurring = require("../Models/Recurring");
const Bank = require("../Models/bankDetails.js");
const OtherExpenses = require("../Models/OtherExpenses");
const Acknowledgement = require("../Models/acknowledgement");
const Proposal = require("../Models/Proposal");
const Auth = require("./auth.js");
const User = require("../Models/user");
const Admin = require("../Models/Admin");
const Schemes = require("../Models/Scheme");
const PI = require("../Models/PI");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const NonRecurring = require("../Models/NonRecurring");
const budgetSanctioned = require("../Models/budgetSanctioned.js");
const Scheme = require("../Models/Scheme");
const acknowledgement = require("../Models/acknowledgement");


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
      const budgetCheck= await budgetsanctioned.findOne({proposalId:_id});
      if(!budgetCheck){
        return res.status(400).json({ success: false, msg: "Budget Already Allocated!!" });
      }
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
      console.log("Final Data:", budgetsanctioned);
      res.json({ success: true, msg: "Project budget Allocated!!", budgetsanctioned });
  
    } catch (error) {
      console.error("Error fetching proposal:", error);
      res.status(500).json({ success: false, msg: "Failed to Fetch Project", error: "Internal Server Error" });
    }
  });




module.exports = router;
