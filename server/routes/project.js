const express = require("express");
const { fetchUser } = require("../Middlewares/fetchUser");
const GeneralInfo = require("../Models/General_Info");
const ResearchDetails = require("../Models/researchDetails");
const User = require("../Models/user");
const router = express.Router();
const Project = require("../Models/Project.js");
const PI = require("../Models/PI");
const YearlyData = require("../Models/YearlyData.js");
const { ObjectId } = require("mongodb");
const RecurringUC = require("../Models/UcRecurring.js");
const NonRecurringUC = require("../Models/UcNonrecurring.js");
const SE = require("../Models/se/SE.js");
const ProgressReport = require("../Models/progressReport.js");
const Scheme = require("../Models/Scheme.js")
const Auth = require("./auth.js");
const nodemailer = require("nodemailer");
const UCRequest = require("../Models/UCRequest.js");
const Report = require("../Models/progressReport.js");
const handleSaveAsPDF = () => {
  const pdf = new jsPDF("p", "mm", "a4");

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("GFR 12-A", 105, 20, { align: "center" });
  pdf.setFontSize(10);
  pdf.text("[See Rule 238 (1)]", 105, 25, { align: "center" });

  pdf.setFontSize(14);
  pdf.text(
    `FINAL UTILIZATION CERTIFICATE FOR THE YEAR ${ucData.currentYear} in respect of`,
    105,
    35,
    { align: "center" }
  );

  pdf.setFontSize(12);
  pdf.text(
    `${selectedType === "recurring" ? "Recurring" : "Non-Recurring"}`,
    105,
    42,
    { align: "center" }
  );

  pdf.setFontSize(10);
  pdf.text(
    `as on ${new Date().toLocaleDateString()} to be submitted to Funding Agency`,
    105,
    48,
    { align: "center" }
  );

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Title of the Project: ${ucData.title}`, 10, 60);
  pdf.text(`Name of the Scheme: ${ucData.scheme}`, 10, 70);
  pdf.text(`Name of the Grant Receiving Organisation: ${ucData.instituteName}`, 10, 80);
  pdf.text(`Name of the Principal Investigator: ${ucData.principalInvestigator}`, 10, 90);
  pdf.text(`Present Year of Project: ${ucData.currentYear}`, 10, 100);
  pdf.text(`Start Date of Year: ${ucData.startDate}`, 10, 110);
  pdf.text(`End Date of Year: ${ucData.endDate}`, 10, 120);

  pdf.text("Financial Summary", 10, 130);
  const financialTableData = [
    ["Carry Forward", "Grant Received", "Total", "Recurring Expenditure", "Closing Balance"],
    [
      `Rs ${ucData.CarryForward}`,
      `Rs ${ucData.yearTotal}`,
      `Rs ${ucData.total}`,
      `Rs ${ucData.recurringExp}`,
      `Rs ${ucData.total - ucData.recurringExp}`,
    ],
  ];

  pdf.autoTable({
    head: [financialTableData[0]],
    body: [financialTableData[1]],
    startY: 135,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
  });

  if (selectedType === "recurring") {
    pdf.text("Component-wise Utilization of Grants", 10, pdf.lastAutoTable.finalY + 10);

    const componentTableData = [
      ["Component", "Amount"],
      ["Human Resources", `Rs ${ucData.human_resources}`],
      ["Consumables", `Rs ${ucData.consumables}`],
      ["Others", `Rs ${ucData.others}`],
    ];

    pdf.autoTable({
      head: [componentTableData[0]],
      body: componentTableData.slice(1),
      startY: pdf.lastAutoTable.finalY + 15,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });
  }

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Certified that I have satisfied myself that:", 10, pdf.lastAutoTable.finalY + 30);

  const terms = [
    "1. The main accounts and other subsidiary accounts and registers (including assets registers) are maintained as prescribed in the relevant Act/Rules/Standing instructions (mention the Act/Rules) and have been duly audited by designated auditors. The figures depicted above tally with the audited figures mentioned in financial statements/accounts.",
    "2. There exist internal controls for safeguarding public funds/assets, watching outcomes and achievements of physical targets against the financial inputs, ensuring quality in asset creation etc. & the periodic evaluation of internal controls is exercised to ensure their effectiveness.",
    "3. To the best of our knowledge and belief, no transactions have been entered that are in violation of relevant Act/Rules/standing instructions and scheme guidelines.",
    "4. The responsibilities among the key functionaries for execution of the scheme have been assigned in clear terms and are not general in nature.",
    "5. The benefits were extended to the intended beneficiaries and only such areas/districts were covered where the scheme was intended to operate.",
    "6. The expenditure on various components of the scheme was in the proportions authorized as per the scheme guidelines and terms and conditions of the grants-in-aid.",
    "7. Details of various schemes executed by the agency through grants-in-aid received from the same Ministry or from other Ministries is enclosed at Annexure-II (to be formulated by the Ministry/Department concerned as per their requirements/specifications).",
  ];

  let y = pdf.lastAutoTable.finalY + 40;
  terms.forEach((term) => {
    const splitText = pdf.splitTextToSize(term, 190);
    pdf.text(splitText, 10, y);
    y += splitText.length * 6;
  });

  pdf.save(`UC_${ucData.title}_${selectedType}.pdf`);
};

router.get("/get-projects", fetchUser, async (req, res) => {
  try {
    let proj = await Project.find({ userId: req.user._id }).populate("Scheme");
    if (proj.length <= 0) {
      return res.status(200).json({ success: false, msg: "No Sanctioned Projects" })
    }
    let projects = await Promise.all(
      proj.map(async (proj) => {
        const start = new Date(proj.startDate);
        const end = new Date(proj.endDate);

        let status = "";
        if (new Date() < start) {
          status = "Approved";
        } else if (new Date() >= start && new Date() <= end) {
          status = "Ongoing";
        } else {
          status = "Completed";
        }
        if (status != proj.status) {
          let project = await Project.findByIdAndUpdate(proj._id, { status: status }, { new: true }).populate("Scheme");
          proj = project;
        }
        return proj;
      })
    )
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
    let { projectid } = req.params;
    console.log(projectid);

    if (!ObjectId.isValid(projectid)) {
      return res.status(400).json({ success: false, msg: "Invalid Project ID" });
    }

    let id = new ObjectId(projectid);
    console.log(id);
    let project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, msg: "Cannot Find Project" });
    }
    console.log(project);
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);

    let status = "";
    if (new Date() < start) {
      status = "Approved";
    } else if (new Date() >= start && new Date() <= end) {
      status = "Ongoing";
    } else {
      status = "Completed";
    }
    project = await Project.findByIdAndUpdate(id, { status: status }, { new: true }).populate("Scheme");
    const ids = await Project.findById(id)
      .populate("generalInfoId researchDetailsId PIDetailsId YearlyDataId");

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
    const scheme = await Scheme.findById(project.Scheme);
    const budget = ids.YearlyDataId?.[project.currentYear - 1]?.budgetSanctioned || null;
    const budgetused = ids.YearlyDataId?.[project.currentYear - 1]?.budgetUsed || null;
    const budgetUnspent = ids.YearlyDataId?.[project.currentYear - 1]?.budgetUnspent || null;
    console.log(project);
    return res.status(200).json({
      success: true,
      msg: "Fetched Project's Details Successfully",
      project,
      scheme: scheme.name,
      generalInfo,
      researchDetails,
      PIDetails,
      budget,
      budgetused,
      budgetUnspent,
      yearlyExp,
      yearlySanct,
    });

  } catch (e) {
    console.log("ProjectError", e);
    return res.status(500).json({ success: false, msg: "Failed to Fetch Project Details", error: "Internal Server Error" });
  }
});
router.post("/uc/recurring/:id", fetchUser, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, msg: "Missing data in request body" });
    }
    const prev = await UCRequest.findOne({ projectId: req.params.id, scheme: data.scheme, currentYear: data.currentYear });
    if (prev) {
      return res.status(400).json({ success: false, msg: "Already Submitted for Current Financial Year" });
    }
    const newGrant = new UCRequest({
      projectId: req.params.id,
      title: data.title,
      scheme: data.scheme,
      currentYear: data.currentYear,
      startDate: data.startDate,
      endDate: data.endDate,
      CarryForward: data.CarryForward,
      yearTotal: data.yearTotal,
      total: data.total,
      type: "recurring",
      recurringExp: data.recurringExp,
      humanResource: data.human_resources,
      consumables: data.consumables,
      others: data.others
    });
    console.log("ucrecurring", newGrant);
    await newGrant.save();
    res.status(201).json({ success: true, msg: "Recurring Grant added successfully", grant: newGrant });
  } catch (error) {
    console.error("Error creating grant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/uc/nonRecurring/:id", fetchUser, async (req, res) => {
  try {
    const { data } = req.body;
    console.log("data", data);
    if (!data) {
      return res.status(400).json({ error: "Missing data in request body" });
    }
    console.log("data", data);
    const prev = await NonRecurringUC.findOne({ projectId: req.params.id, scheme: data.scheme, currentYear: data.currentYear });
    if (prev) {
      return res.status(400).json({ success: false, msg: "Already Submitted for Current Financial Year" });
    }
    const newGrant = new NonRecurringUC({
      projectId: req.params.id,
      title: data.title,
      scheme: data.scheme,
      currentYear: data.currentYear,
      startDate: data.startDate,
      endDate: data.endDate,
      type: "nonRecurring",
      CarryForward: data.CarryForward,
      yearTotal: data.yearTotal,
      total: data.total,
      nonRecurringExp: data.nonRecurringExp,
    });

    await newGrant.save();
    res.status(201).json({ success: true, msg: "Recurring Grant added successfully", grant: newGrant });
  } catch (error) {
    console.error("Error creating grant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/ucforms/:id", fetchUser, async (req, res) => {
  try {
    const grant = await UCRequest.find({ projectId: req.params.id }).populate("projectId").populate("scheme");
    const se = await SE.find({ projectId: req.params.id });

    if (grant.length <= 0 && recurringgrant.length <= 0 && se.length <= 0) {
      return res.status(404).json({ succes: false, msg: "Certificates not found" });
    }


    res.status(200).json({ success: true, grant, se, msg: "Certificates Fetched" });
  } catch (error) {
    console.error("Error fetching Certificates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/ucforms/recurring/:id", fetchUser, async (req, res) => {
  try {
    const grant = await UCRequest.findById(req.params.id);

    if (!grant) {
      return res.status(404).json({ succes: false, msg: "Utilization Certificate not found" });
    }
    res.status(200).json({ success: true, grant, msg: "Utilization Certificate Details Fetched" });
  } catch (error) {
    console.error("Error fetching grant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/ucforms/nonRecurring/:id", fetchUser, async (req, res) => {
  try {
    console.log(req.params.id);
    const { id } = req.params
    const grant = await UCRequest.findById(id);
    console.log(grant);
    if (!grant) {
      return res.status(400).json({ succes: false, msg: "Utilization Certificate not found" });
    }
    res.status(200).json({ success: true, grant, msg: "Utilization Certificate  Details Fetched" });
  } catch (error) {
    console.error("Error fetching grant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/se", fetchUser, async (req, res) => {
  try {
    const { data, yearlyBudget, budgetSanctioned, manpower, consumables, others, equipment, total, totalExp, balance, piSignature } = req.body;
    if (!data || !yearlyBudget || !budgetSanctioned || !manpower || !consumables || !others || !equipment || !total || !totalExp || !balance || !piSignature) {
      return res.status(400).json({ success: false, msg: "Fill all the Details" });
    }
    const seCheck = await SE.findOne({ projectId: data.projectId, scheme: data.scheme, currentYear: data.currentYear });
    console.log(seCheck);
    if (seCheck) {
      return res.status(400).json({ success: false, msg: "Statement for Current Financial Year was already Submitted" })
    }
    let se = new SE({
      projectId: data.projectId,
      name: data.name,
      institute: data.institute,
      scheme: data.scheme,
      currentYear: data.currentYear,
      startDate: data.startDate,
      endDate: data.endDate,
      TotalCost: data.TotalCost,
      yearlyBudget: yearlyBudget,
      budgetSanctioned: budgetSanctioned,
      human_resources: manpower,
      consumables: consumables,
      others: others,
      nonRecurring: equipment,
      total: total,
      totalExp: totalExp,
      balance: balance,
      piSignature: piSignature,
    });
    await se.save();
    se = await SE.findById(se._id).populate("scheme");

    res.status(200).json({ success: true, msg: "Statement of Expenditure not Submitted", se });
  }
  catch (e) {
    console.error("Error Submitting SE:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.get("/se/:id", fetchUser, async (req, res) => {
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

router.post("/progress-report/:id", fetchUser, async (req, res) => {
  const { id } = req.params;
  const { data, type } = req.body;

  try {
    const check = await ProgressReport.findOne({ projectId: id, currentYear: data.currentYear });
    console.log(check);
    if (check && type !== "Final") {
      return res.status(400).json({ success: false, msg: "A yearly Report for Current Financial Year was already submitted" });
    }
    const formattedData = {
      ...data,
      approvedObjectives: Array.isArray(data.approvedObjectives)
        ? data.approvedObjectives
        : (typeof data.approvedObjectives === "string" ? data.approvedObjectives.split(",") : []),
      majorEquipment: Array.isArray(data.majorEquipment)
        ? data.majorEquipment
        : [data.majorEquipment]
    };

    const progressReport = new ProgressReport({
      projectId: id,
      type,
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
    const progressReports = await Report.find({ projectId: id }).populate("projectId");
    res.status(200).json({ success: true, data: progressReports });
  } catch (error) {
    console.error("Error fetching progress reports:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});
router.get("/reports/:id", fetchUser, async (req, res) => {
  const { id } = req.params;
  try {
    console.log(id);
    const progressReports = await Report.findById(id)
      .populate("projectId")
      .populate("principalInvestigator")
      .populate("coPrincipalInvestigator");
    console.log(progressReports);
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

    const project = await Project.findById(projectId)
      .populate("YearlyDataId")
      .populate("generalInfoId", "instituteName")
      .populate("userId", "Name")
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const currentYearData = project.YearlyDataId[project.currentYear - 1];
    if (!currentYearData) {
      return res.status(404).json({ success: false, message: "Yearly data not found for the current year" });
    }
    const schemeDetails = await Scheme.findById(project.Scheme);
    const schemeName = schemeDetails ? schemeDetails.name : "Unknown Scheme";
    const recurringUCData = {
      projectId: project._id,
      title: project.Title,
      scheme: schemeName,
      currentYear: project.currentYear,
      startDate: project.startDate ? new Date(project.startDate).toLocaleDateString() : "Unknown Start Date",
      principalInvestigator: project.PI,
      endDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : "Unknown end Date",
      CarryForward: currentYearData.budgetUnspent,
      yearTotal: currentYearData.budgetSanctioned.yearTotal,
      total: currentYearData.budgetUnspent + currentYearData.budgetSanctioned.yearTotal,
      recurringExp: currentYearData.budgetUsed.recurring.total,
      human_resources: currentYearData.budgetUsed.recurring.human_resources,
      consumables: currentYearData.budgetUsed.recurring.consumables,
      others: currentYearData.budgetUsed.recurring.others,
      instituteName: project.generalInfoId?.instituteName || "Unknown Institute",
    };
    console.log("recurringUCData", recurringUCData);

    res.status(200).json({ success: true, data: recurringUCData });
  } catch (error) {
    console.error("Error generating recurring UC:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/generate-uc/nonRecurring/:id", fetchUser, async (req, res) => {
  try {
    const { id: projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("YearlyDataId")
      .populate("generalInfoId", "instituteName");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const currentYearData = project.YearlyDataId[project.currentYear - 1];
    if (!currentYearData) {
      return res.status(404).json({ success: false, message: "Yearly data not found for the current year" });
    }

    const schemeDetails = await Scheme.findById(project.Scheme);
    const schemeName = schemeDetails ? schemeDetails.name : "Unknown Scheme";

    const nonRecurringUCData = {
      projectId: project._id,
      title: project.Title,
      scheme: schemeName,
      currentYear: project.currentYear,
      startDate: project.startDate ? new Date(project.startDate).toLocaleDateString() : "Unknown Start Date",
      principalInvestigator: project.PI,
      endDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : "Unknown end Date",
      CarryForward: currentYearData.budgetUnspent,
      yearTotal: currentYearData.budgetSanctioned.yearTotal,
      total: currentYearData.budgetUnspent + currentYearData.budgetSanctioned.yearTotal,
      nonRecurringExp: currentYearData.budgetUsed.nonRecurring,
      instituteName: project.generalInfoId?.instituteName || "Unknown Institute",
    };

    res.status(200).json({ success: true, data: nonRecurringUCData });
  } catch (error) {
    console.error("Error generating non-recurring UC:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/view-uc/se/:id", fetchUser, async (req, res) => {
  try {
    const { id } = req.params;
    const se = await SE.find({ projectId: id });
    const grant = await UCRequest.find({ projectId: id });
    if (!se) {
      return res.status(400).json({ success: false, msg: "Statement of Expenditure Not Found" })
    }
    res.status(200).json({ success: true, msg: "Statement of Expenditure not Submitted", se, grant });
  }
  catch (e) {
    console.error("Error Fetching SE:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
})


module.exports = router;