const express = require("express");
const fetch = require("node-fetch");
const { fetchUser } = require("../MiddleWares/fetchUser.js");
const { fetchAdmin } = require("../MiddleWares/fetchAdmin.js");
const GeneralInfo = require("../Models/General_Info");
const ResearchDetails = require("../Models/researchDetails");
const Budget = require("../Models/Budget");
const Recurring = require("../Models/Recurring");
const Bank = require("../Models/bankDetails.js");
const bankDetails = require("../Models/bankDetails");
const Proposal = require("../Models/Proposal");
const Auth = require("./auth.js");
const User = require("../Models/user");
const Admin = require("../Models/Admin");
const Schemes = require("../Models/Scheme");
const PI = require("../Models/PI");
const router = express.Router();
const YearlyData = require("../Models/YearlyData");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const NonRecurring = require("../Models/NonRecurring");
const budgetSanctioned = require("../Models/budgetSanctioned.js");
const Scheme = require("../Models/Scheme");
const Project = require("../Models/Project.js")
const { ObjectId } = require("mongodb");
const RecurringUC = require("../Models/UcRecurring.js");
const NonRecurringUC = require("../Models/UcNonrecurring.js");
const SE = require("../Models/se/SE.js");
const Comment = require("../Models/comment.js");
const UCRequest = require("../Models/UCRequest.js");
const ProgressReport = require("../Models/progressReport");
const sendEmail = require("./sendEmail.js");

router.get("/approvedProposals", fetchAdmin, async (req, res) => {
  try {
    const userId = req.admin.id;
    console.log("User ID from Token:", userId);
    const Schemes = await Scheme.find({ coordinator: userId });
    console.log(Schemes);
    if (!Schemes) {
      return res.status(400).json({ success: false, msg: "No Schemes found" });
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
  const { id } = req.params;
  try {
    const userId = req.admin.id;
    console.log("User ID from Token:", userId);
    const proposals = await Proposal.findById(id);
    console.log("Fetched Proposals:", proposals);
    if (!proposals) {
      return res.status(400).json({ success: false, msg: "Proposal Not found" });
    }
    console.log(id);
    const researchDetails = await ResearchDetails.findOne({ proposalId: id }).select("Title");
    const budget = await Budget.findOne({ proposalId: id });
    console.log(budget);
    if (!budget) {
      return res.status(400).json({ success: false, msg: "Proposal Not found" });
    }
    res.json({ success: true, msg: "Projects Fetched", budget, researchDetails });

  } catch (error) {
    console.error("Error fetching proposals:", error.message);
    res.status(500).json({ success: false, msg: "Failed to Fetch Projects", error: "Internal Server Error" });
  }
});

router.post("/allocate-budget/:id", fetchAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [budgetCheck, generalInfo] = await Promise.all([
      budgetSanctioned.findOne({ proposalId: id }),
      GeneralInfo.findOne({ proposalId: id }).select("email")
    ]);
    console.log(1);
    if (!generalInfo) {
      return res.status(400).json({ success: false, msg: "General Info not found" });
    }

    const user = await User.findOne({ email: generalInfo.email }).select("_id");
    if (!user) {
      return res.status(400).json({ success: false, msg: "User not found" });
    }

    if (budgetCheck) {
      return res.status(400).json({ success: false, msg: "Budget Already Allocated!" });
    }
    console.log(2);

    const proposal = await Proposal.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
    if (!proposal) {
      return res.status(400).json({ success: false, msg: "No proposals found" });
    }
    console.log(3);
    const newBudget = new budgetSanctioned({
      proposalId: id,
      TotalCost: req.body.TotalCost,
      budgetTotal: req.body.budgettotal,
      budgetSanctioned: req.body.budgetsanctioned
    });
    console.log(4);
    await newBudget.save();
    console.log(5);
    const projectData = await response.json();
    console.log("Project:", projectData);
    if (!projectData.success) {
      await Promise.all([
        budgetSanctioned.findByIdAndDelete(newBudget._id),
        Proposal.findByIdAndUpdate(id, { status: "Approved" }),
        Project.findByIdAndDelete(projectData?._id)
      ]);
      return res.status(500).json({ success: false, msg: "Project creation failed, budget rollback executed" });
    }
    console.log(6);
    res.json({ success: true, msg: "Project budget allocated!", project: projectData });
  } catch (error) {
    console.error("Error allocating budget:", error.message);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
});

router.post("/createProject/:proposalId", async (req, res) => {
  const { proposalId } = req.params;
  try {
    console.log("Proposal ", proposalId);
    const proposal = await Proposal.findById(proposalId);
    console.log("Fetched Proposals:", proposal);
    console.log(7);
    if (!proposal || proposal.status !== 'Sanctioned') {
      return res.status(400).json({ success: false, msg: "No Sanctioned proposal found" });
    }
    console.log(6);
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
    const user1 = await User.findOne({ email: generalInfo.email, Institute: generalInfo.instituteName });
    if (!user1) {
      return res.status(400).json({ success: false, msg: "Cannot Find User" });
    }
    console.log(budgetsanctioned);
    if (!budgetsanctioned) {
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
      userId: user1._id,
      Scheme: proposal.Scheme,
      Title: researchDetails.Title,
      PI: PIS,
      CoPI: coPIS,
      years: parseFloat(researchDetails.Duration) / 12,
      currentYear: 1,
      startDate: new Date(),
      TotalCost: budgetsanctioned.TotalCost,
      TotalUsed: 0,
      CarryForward: {
        overhead: 0,
        nonRecurring: 0,
        recurring: {
          human_resources: 0,
          travel: 0,
          consumables: 0,
          others: 0,
          total: 0
        },
        yearTotal: 0,
      },
      budgetTotal: budgetsanctioned.budgetTotal,
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
      budgetUnspent: 0,
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
    const proposal1 = await Proposal.findByIdAndUpdate(proposalId, { status: "Sanctioned" }, { new: true });
    res.json({ success: true, msg: "Project Created", projectUpdated });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ success: false, msg: "Failed to Fetch Projects", error: "Internal Server Error" });
  }
});

router.get("/get-projects", fetchAdmin, async (req, res) => {
  try {
    if (!req.admin || !req.admin.id) {
      return res.status(400).json({ success: false, msg: "Admin ID is missing or invalid" });
    }
    const schemes = await Scheme.find({ coordinator: req.admin.id }).select("_id");
    if (!schemes || schemes.length === 0) {
      return res.status(404).json({ success: false, msg: "No schemes found for this admin" });
    }

    const schemeIds = schemes.map(scheme => scheme._id);
    console.log(schemeIds);

    const proposals = await Project.find({ Scheme: { $in: schemeIds } }).populate("Scheme");
    if (!proposals || proposals.length === 0) {
      return res.status(404).json({ success: false, msg: "No Projects found" });
    }

    const data = await Promise.all(
      proposals.map(async (proposal) => {
        const generalInfo = await GeneralInfo.findById(proposal.generalInfoId);
        const researchDetails = await ResearchDetails.findById(proposal.researchDetailsId);
        return { proposal, generalInfo, researchDetails };
      })
    );

    console.log("Final Data:", data);
    res.json({ success: true, msg: "Projects Fetched", data });

  } catch (error) {
    console.error("Error fetching Projects:", error);
    res.status(500).json({ success: false, msg: "Failed to Fetch Projects", error: "Internal Server Error" });
  }
});

router.get("/get-project/:projectid", fetchAdmin, async (req, res) => {
  try {
    let { projectid } = req.params;
    let id = new ObjectId(projectid);
    const project = await Project.findById(id);
    const ids = await Project.findById(id)
      .populate("generalInfoId researchDetailsId PIDetailsId YearlyDataId");
    console.log(project);
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
    const budgetUnspent = ids.YearlyDataId?.[project.currentYear - 1]?.budgetUnspent || null;
    return res.status(200).json({
      success: true, msg: "Fetched Project's Details Successfully",
      project, generalInfo, researchDetails, PIDetails, budget, budgetused, budgetUnspent, yearlyExp, yearlySanct,
    })
  } catch (e) {
    console.log("ProjectError", e);
    return res.status(500).json({ success: false, msg: "Failed to Fetch Project Details", error: "Internal Server Error" });
  }
})

router.get("/ucforms/:id", fetchAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, msg: "Project ID is required" });
    }

    const pendingUCs = await UCRequest.find({ projectId: id, status: "pendingAdminApproval" });

    if (!pendingUCs || pendingUCs.length === 0) {
      return res.status(200).json({ success: true, msg: "No pending UCs found for admin approval", data: [] });
    }

    res.status(200).json({
      success: true,
      msg: "Pending UCs for admin approval fetched successfully",
      data: pendingUCs,
    });
  } catch (error) {
    console.error("Error fetching pending UCs:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
router.get("/ucforms/approved/:id", fetchAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, msg: "Project ID is required" });
    }

    const approvedUCs = await UCRequest.find({ projectId: id, status: "approvedByAdmin" });

    if (!approvedUCs || approvedUCs.length === 0) {
      return res.status(200).json({ success: true, msg: "No approved UCs found for admin approval", data: [] });
    }

    res.status(200).json({
      success: true,
      msg: "Approved UCs for admin approval fetched successfully",
      data: approvedUCs,
    });
  } catch (error) {
    console.error("Error fetching approved UCs:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/seforms/:id", fetchAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, msg: "Project ID is required" });
    }

    const pendingSEs = await SE.find({ projectId: id, status: "pendingAdminApproval" });

    if (!pendingSEs || pendingSEs.length === 0) {
      return res.status(200).json({ success: true, msg: "No pending SEs found for admin approval", data: [] });
    }

    res.status(200).json({
      success: true,
      msg: "Pending SEs for admin approval fetched successfully",
      data: pendingSEs,
    });
  } catch (error) {
    console.error("Error fetching pending SEs:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/seforms/approved/:id", fetchAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, msg: "Project ID is required" });
    }

    const approvedSEs = await SE.find({ projectId: id, status: "approvedByAdmin" });

    if (!approvedSEs || approvedSEs.length === 0) {
      return res.status(200).json({ success: true, msg: "No approved SEs found for admin approval", data: [] });
    }

    res.status(200).json({
      success: true,
      msg: "Approved SEs for admin approval fetched successfully",
      data: approvedSEs,
    });
  } catch (error) {
    console.error("Error fetching approved SEs:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.put("/se-admin-approval/:id", fetchAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const seRequest = await SE.findById(id);

    if (!seRequest) {
      return res.status(404).json({ success: false, message: "SE request not found" });
    }

    if (seRequest.status !== "pendingAdminApproval") {
      return res.status(400).json({ success: false, message: "SE is not pending admin approval" });
    }

    if (action === "approve") {
      seRequest.status = "approvedByAdmin";
    } else if (action === "reject") {
      seRequest.status = "rejectedByAdmin";
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await seRequest.save();

    res.status(200).json({ success: true, message: `SE ${action}d by admin` });
  } catch (error) {
    console.error("Error during admin approval:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/ucforms/recurring/:id", fetchAdmin, async (req, res) => {
  try {
    const grant = await RecurringUC.findById(req.params.id);
    const project1 = await Project.findById(grant.projectId);
    const project = await User.findById(project1.userId);
    if (!grant) {
      return res.status(404).json({ succes: false, msg: "Utilization Certificate not found" });
    }
    res.status(200).json({ success: true, grant, project, msg: "Utilization Certificate Details Fetched" });
  } catch (error) {
    console.error("Error fetching grant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/ucforms/nonRecurring/:id", fetchAdmin, async (req, res) => {
  try {
    console.log(req.params.id);
    const { id } = req.params
    const grant = await NonRecurringUC.findById(id);
    const project1 = await Project.findById(grant.projectId);
    const project = await User.findById(project1.userId);

    console.log(grant, project);
    if (!grant) {
      return res.status(400).json({ succes: false, msg: "Utilization Certificate not found" });
    }
    res.status(200).json({ success: true, grant, project, msg: "Utilization Certificate  Details Fetched" });
  } catch (error) {
    console.error("Error fetching grant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/se/:id", fetchAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const se = await SE.findById(id);
    if (!se) {
      return res.status(400).json({ success: false, msg: "Statement of Expenditure Not Found" })
    }
    res.status(200).json({ success: true, msg: "Statement of Expenditure not Submitted", se });
  }
  catch (e) {
    console.error("Error Fetching SE:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.post("/add-comment/:id", fetchAdmin, async (req, res) => {
  const { comment, certificate, user } = req.body;
  try {
    if (!comment) {
      return res.status(400).json({ success: false, msg: "Enter Comment" })
    }
    const Check = await Comment.findOne({ certificateId: new Object(req.params.id) });
    if (Check) {
      const id = new ObjectId(Check._id);
      const comm = await Comment.findByIdAndUpdate({ _id: id }, { comment }, { new: true })
      return res.status(200).json({ success: true, comm, msg: "Comment Saved!!" })
    }
    const com = new Comment({
      certificateId: req.params.id,
      comment,
      type: certificate?.type ?? "SE",
      userId: user
    })
    await com.save();
    res.status(200).json({ success: true, msg: "Comment Saved!!", com });
  }
  catch (e) {
    console.error("Error Saving Comment:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.get("/ucforms/view/:id", fetchAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, msg: "Certificate ID is required" });
    }

    const certificate = await UCRequest.findById(id);

    if (!certificate) {
      return res.status(404).json({ success: false, msg: "Certificate not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Certificate details fetched successfully",
      data: certificate,
    });
  } catch (error) {
    console.error("Error fetching certificate details:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/view-by-se/:seId", fetchAdmin, async (req, res) => {
  try {
    const { seId } = req.params;

    const seDetails = await SE.findOne({ _id: seId });

    if (!seDetails) {
      return res.status(404).json({ success: false, message: "SE not found" });
    }

    res.status(200).json({ success: true, data: seDetails });
  } catch (error) {
    console.error("Error fetching SE details by sc ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/all-ucforms/", fetchAdmin, async (req, res) => {
  try {
    const ucForms = await UCRequest.find({status : "pendingAdminApproval"}).sort({ createdAt: -1 });
    console.log("UC Forms:", ucForms);
    if (!ucForms || ucForms.length === 0) {
      return res.status(404).json({ success: false, msg: "No UC forms found" });
    }
    res.status(200).json({ success: true, msg: "UC forms fetched successfully", data: ucForms });
  } catch (error) {
    console.error("Error fetching UC forms:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});


router.get("/all-seforms", fetchAdmin, async (req, res) => {
  try {
    const seForms = await SE.find({status : "pendingAdminApproval"}).sort({ createdAt: -1 });
    console.log("SE Forms:", seForms);
    if (!seForms || seForms.length === 0) {
      return res.status(404).json({ success: false, msg: "No SE forms found" });
    }
    res.status(200).json({ success: true, msg: "SE forms fetched successfully", data: seForms });
  } catch (error) {
    console.error("Error fetching SE forms:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/progress-reports", async (req, res) => {
  try {
      const reports = await ProgressReport.find({ read: false }).populate("projectId");
      res.status(200).json({ success: true, data: reports });
  } catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.put("/progress-reports/:id/mark-as-read", async (req, res) => {
  try {
      const { id } = req.params;
      await ProgressReport.findByIdAndUpdate(id, { read: true });
      res.status(200).json({ success: true, message: "Report marked as read" });
  } catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
// id is the projectId, not object id of progress report
router.get("/progress-reports/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const report = await ProgressReport.find({projectId: id});
      if (!report) {
          return res.status(404).json({ success: false, message: "Report not found" });
      }
      res.status(200).json({ success: true, data: report });
      console.log(report);
  } catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});



router.get("/completed-projects", fetchAdmin, async (req, res) => {
    try {
        const userId = req.admin.id;
        console.log("User ID from Token:", userId);

        const schemes = await Scheme.find({ coordinator: userId });
        console.log("Fetched Schemes:", schemes);

        if (!schemes || schemes.length === 0) {
            return res.status(400).json({ success: false, msg: "No schemes found for this admin." });
        }

        const schemeIds = schemes.map((scheme) => scheme._id);

        const completedProjects = await Project.find({
            Scheme: { $in: schemeIds },
            status: "Completed", 
        }).populate("generalInfoId bankDetailsId researchDetailsId PIDetailsId YearlyDataId");

        console.log("Fetched Completed Projects:", completedProjects);

        if (!completedProjects || completedProjects.length === 0) {
            return res.status(400).json({ success: false, msg: "No completed projects found." });
        }

        res.status(200).json({
            success: true,
            msg: "Completed projects fetched successfully.",
            data: completedProjects,
        });
    } catch (error) {
        console.error("Error fetching completed projects:", error);
        res.status(500).json({ success: false, msg: "Internal server error." });
    }
});

router.get('/dashboard-stats', fetchAdmin, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const adminRole = req.admin.role;
    console.log("Admin ID:", adminId, "Role:", adminRole);

    let schemeIds = [];
    let adminSchemes = [];

    if (adminRole === "Head Coordinator") {
      adminSchemes = await Schemes.find({});
      schemeIds = adminSchemes.map(scheme => scheme._id);
    } else {
      adminSchemes = await Schemes.find({ coordinator: adminId });
      schemeIds = adminSchemes.map(scheme => scheme._id);
    }

    const totalProjects = await Project.countDocuments({ Scheme: { $in: schemeIds } });
    const activeProjects = await Project.countDocuments({
      Scheme: { $in: schemeIds },
      status: "Ongoing"
    });
    const completedProjects = await Project.countDocuments({
      Scheme: { $in: schemeIds },
      status: "Completed"
    });
    const approvedProjects = await Project.countDocuments({
      Scheme: { $in: schemeIds },
      status: "Approved"
    });

    const schemes = await Project.aggregate([
      { $match: { Scheme: { $in: schemeIds } } },
      {
        $group: {
          _id: "$Scheme",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "schemes", 
          localField: "_id",
          foreignField: "_id",
          as: "schemeInfo"
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          schemeName: { $arrayElemAt: ["$schemeInfo.name", 0] }
        }
      }
    ]);

    console.log("SCHEMES:", schemes);

    const fundTrend = await Project.aggregate([
      { $match: { Scheme: { $in: schemeIds } } },
      {
        $group: {
          _id: { $substr: ["$startDate", 5, 2] },
          funds: { $sum: "$TotalCost" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalFunds = await Project.aggregate([
      { $match: { Scheme: { $in: schemeIds } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$TotalCost" }
        }
      }
    ]);

    const fundApproved = totalFunds.length > 0
      ? `₹ ${(totalFunds[0].total / 100000).toFixed(2)}L`
      : "₹ 0L";

    res.json({
      userRole: adminRole,
      summaryCards: {
        totalSchemes: adminSchemes.length,
        totalProjects,
        activeProjects,
        fundApproved
      },
      projectStats: [
        { name: "Ongoing", value: activeProjects },
        { name: "Completed", value: completedProjects },
        { name: "Approved", value: approvedProjects }
      ],
      schemeProjects: schemes.map(s => ({
        scheme: s.schemeName || "Unknown",
        projects: s.count
      })),
      fundTrend: fundTrend.map(entry => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = parseInt(entry._id, 10) - 1;
        const monthName = monthNames[monthIndex] || entry._id;

        return {
          month: monthName,
          funds: entry.funds
        };
      })
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: err.message });
  }
});
router.post('/allocateBudget', fetchAdmin, async (req, res) => {
  try {
    if (!req.body || !req.body.budgetData || !req.body.projectId) {
        return res.status(400).json({ success: false, message: "Invalid request body. 'budgetData' and 'projectId' are required." });
    }
    const budgetData = req.body.budgetData;
    const projectId = req.body.projectId;
    console.log(budgetData);
    if (!budgetData || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Budget data and project ID are required"
      });
    }

    const requiredFields = [
      'overhead', 'nonRecurring', 'total', 
      'recurring.travel', 'recurring.consumables',
      'recurring.human_resources', 'recurring.total'
    ];

    for (const field of requiredFields) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], budgetData);
      if (value === undefined || value === null) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    const project = await Project.findById(projectId).populate("userId");
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    if(project.YearlyDataId.length>=project.currentYear){
      return res.status(400).json({
        success: false,
        message: "Budget For current Year Already Allocated!!"
      });    }
    const yearData = new YearlyData({
      budgetUnspent: budgetData.total,
      projectId: projectId,
      budgetSanctioned: {
        nonRecurring: budgetData.nonRecurring,
        overhead: budgetData.overhead,
        recurring: {
          travel: budgetData.recurring.travel,
          consumables: budgetData.recurring.consumables,
          human_resources: budgetData.recurring.human_resources,
          others: budgetData.recurring.others,
          total: budgetData.recurring.total,
        },
        yearTotal: budgetData.total
      },
      budgetUsed: {  
        nonRecurring: 0,
        overhead: 0,
        recurring: {
          travel: 0,
          consumables: 0,
          human_resources: 0,
          others: 0,
          total: 0,
        },
        yearTotal: 0
      }
    });

    await yearData.save();

    project.YearlyDataId = [...(project.YearlyDataId || []), yearData._id];
    await project.save();

    try {
      await sendEmail(
        req.admin.email,
        project.userId.email,
        `Information on Budget Allocation - ${projectId}`,
        `Dear ${project.userId.Name},\n\nWe are pleased to inform you that the budget for your project (ID: ${projectId}) has been successfully allocated.\n\nAllocated Budget Details:
        - Total: ₹${budgetData.total}
        - Overhead: ₹${budgetData.overhead}
        - Non-Recurring: ₹${budgetData.nonRecurring}
        - Recurring Total: ₹${budgetData.recurring.total}
          - Human Resources: ₹${budgetData.recurring.human_resources}
          - Travel: ₹${budgetData.recurring.travel}
          - Consumables: ₹${budgetData.recurring.consumables}
          - Others: ₹${budgetData.recurring.others}
        
        Please check the project dashboard for detailed information.\n\nBest regards,\nResearchX Team`
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Budget allocated successfully",
      data: {
        yearData,
        updatedProject: project
      }
    });

  } catch (err) {
    console.error("Budget Allocation error:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: err.message 
    });
  }
});
module.exports = router;