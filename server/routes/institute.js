

const express = require("express");
const router = express.Router();
const Proposal = require("../Models/Proposal");
const User = require("../Models/user");
const GeneralInfo = require("../Models/General_Info");
const ResearchDetails = require("../Models/researchDetails");
const Budget = require("../Models/Budget");
const Recurring = require("../Models/Recurring");
const NonRecurring = require("../Models/NonRecurring");
const Bank = require("../Models/bankDetails.js");
const Acknowledgement = require("../Models/acknowledgement");
const Institute = require("../Models/instituteID");
const Project = require("../Models/Project.js");
const PI = require("../Models/PI");
const bankDetails = require("../Models/bankDetails.js");
const budgetSanctioned = require("../Models/budgetSanctioned.js");
const YearlyData = require("../Models/YearlyData.js");
const { fetchInstitute } = require("../MiddleWares/fetchInstitute");
const {ObjectId}=require("mongodb");
const mongoose=require("mongoose");

router.get("/institute-projects", fetchInstitute, async (req, res) => {
  try {
    const institute = req.institute.college;

    const users = await User.find({ Institute: institute });
    const userIds = users.map(user => user._id);

    const projects = await Proposal.find({ userId: { $in: userIds }, status: "Accepted" }).populate('userId', 'Name');

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res.status(500).json({ success: false, msg: "Failed to fetch projects", error: error.message });
  }
});

router.get("/users", fetchInstitute, async (req, res) => {
  try {
    const institute = req.institute.college;

    const users = await User.find({ Institute: institute });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ success: false, msg: "Failed to fetch users", error: error.message });
  }
});

  router.get("/:userId/accepted-proposals", fetchInstitute, async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(userId);
      const proposals = await Proposal.find({ userId: userId, status: "Accepted" });
      console.log(proposals);
      if (!proposals.length) {
        return res.status(404).json({ success: false, msg: "No accepted proposals found" });
      }
      res.status(200).json({ success: true, proposals });
    } catch (error) {
      console.error("Error fetching accepted proposals:", error.message);
      res.status(500).json({ success: false, msg: "Failed to fetch accepted proposals", error: error.message });
    }
  });

  router.get("/sanctioned-projects", fetchInstitute, async (req, res) => {
    try {
      const institute = req.institute.college;
      console.log(req);
      const users = await User.find({ Institute: institute }).select("_id");
      const userIds = users.map(user => user._id); 
      console.log("Projects",users,userIds);
      const projects = await Project.find({ userId: { $in: userIds } });
      console.log("Projects",projects);
      if (!projects.length) {
        return res.status(404).json({ success: false, msg: "No sanctioned projects found" });
      } 

      res.status(200).json({ success: true, projects });
    } catch (error) {
      console.error("Error fetching sanctioned projects:", error.message);
      res.status(500).json({ success: false, msg: "Failed to fetch sanctioned projects", error: error.message });
    }
  });

  router.get("/get-project-insti/:projectid", fetchInstitute, async (req, res) => {
    try {
        let { projectid } = req.params;
        let id = new ObjectId(projectid);
        console.log(id);

        const project = await Project.findById(id);
        const ids = await Project.findById(id).populate("generalInfoId researchDetailsId PIDetailsId YearlyDataId");

        if (!project) {
            return res.status(400).json({ success: false, msg: "Cannot Find Project" });
        }

        const generalInfo = await GeneralInfo.findById(ids.generalInfoId);
        const researchDetails = await ResearchDetails.findById(ids.researchDetailsId);
        const PIDetails = await PI.findById(ids.PIDetailsId);
        const yearlyData = await Promise.all(
            ids.YearlyDataId.map(async (Id) => {
                const budget = await YearlyData.findById(Id);
                return budget ? budget.budgetSanctioned : null;
            })
        );

        const budget = ids.YearlyDataId?.[project.currentYear - 1]?.budgetSanctioned || null;
        const budgetused = ids.YearlyDataId?.[project.currentYear - 1]?.budgetUsed || null;
        const budgetUnspent = ids.YearlyDataId?.[project.currentYear - 1]?.budgetUnspent || null;

        return res.status(200).json({
            success: true,
            msg: "Fetched Institute's Project Dashboard Successfully",
            project,
            generalInfo,
            researchDetails,
            PIDetails,
            budget,
            budgetused,
            budgetUnspent
        });
    } catch (e) {
        console.log("InstituteProjectError", e);
        return res.status(500).json({ success: false, msg: "Failed to Fetch Project Dashboard", error: "Internal Server Error" });
    }
});

router.get("/get-ucRecurring-insti", fetchInstitute, async (req, res) => {
  try {
      const institute = req.institute.college;
      console.log(req.institute.college);
      const users = await User.find({ Institute: institute }).select("_id");
      const userIds = users.map(user => user._id);
      const projects = await Project.find({ userId: { $in: userIds } });
      // console.log("Projects Found:", projects);
      // console.log("Imported RecurringUC Model:", RecurringUC);
      // console.log("Type of RecurringUC:", typeof RecurringUC);
    //   const recurring = await RecurringUC.find({
    //     projectId: { $in: projects.map(project => project._id) }
    // });
    const projectIds = projects.map(project => new mongoose.Types.ObjectId(project._id));
    // console.log("Project IDs:", projectIds);

    const recurring = await mongoose.connection.db.collection('recurringucs').find(
      { projectId: { $in: projectIds } ,
      status: "Pending for institute approval."      
    }).toArray();
    // console.log("Recurring UC Found:", recurring);
      if (!recurring.length) {
          return res.status(404).json({ success: false, msg: "No Recurring UC found" });
      }

      return res.status(200).json({ success: true, recurring });
  } catch (error) {
      console.error("Error fetching Recurring UC:", error.message);
      return res.status(500).json({ success: false, msg: "Failed to fetch Recurring UC", error: error.message });
  }
});

router.get("/get-ucNonRecurring-insti", fetchInstitute, async (req, res) => {
  try {
      const institute = req.institute.college;
      const users = await User.find({ Institute: institute }).select("_id");
      const userIds = users.map(user => user._id);
      const projects = await Project.find({ userId: { $in: userIds } });

      const projectIds = projects.map(project => new mongoose.Types.ObjectId(project._id));
      console.log("Project IDs:", projectIds);

      const nonRecurring = await mongoose.connection.db.collection('nonrecurringucs').find(
          { projectId: { $in: projectIds },
          status: "Pending for institute approval."      
      }).toArray();

      if (!nonRecurring.length) {
          return res.status(404).json({ success: false, msg: "No Non-Recurring UC found" });
      }

      return res.status(200).json({ success: true, nonRecurring });
  } catch (error) {
      console.error("Error fetching Non-Recurring UC:", error.message);
      return res.status(500).json({ success: false, msg: "Failed to fetch Non-Recurring UC", error: error.message });
  }
});


module.exports = router;