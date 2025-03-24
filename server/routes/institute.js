
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
const Expense = require("../Models/expense.js");
const bankDetails = require("../Models/bankDetails.js");
const budgetSanctioned = require("../Models/budgetSanctioned.js");
const YearlyData = require("../Models/YearlyData.js");
const csv = require("csv-parser");
const { fetchInstitute } = require("../MiddleWares/fetchInstitute");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const moment = require("moment");

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
    const proposals = await Proposal.find({ userId: userId, status: "Accepted" });
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
    console.log("Projects", users, userIds);
    const projects = await Project.find({ userId: { $in: userIds } });
    console.log("Projects", projects);
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
    console.log("Received Project ID:", projectid);

    let id;
    try {
      id = new ObjectId(projectid);
    } catch (error) {
      console.error("Invalid Project ID:", projectid);
      return res.status(400).json({ success: false, msg: "Invalid Project ID" });
    }

    console.log("Searching for Project with ID:", id);

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
      {
        projectId: { $in: projectIds },
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
      {
        projectId: { $in: projectIds },
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

router.post("/upload-expenses", async (req, res) => {
  try {
    const { projectId, csvData } = req.body;

    if (!projectId || !csvData) {
      return res.status(400).json({ success: false, message: "Missing project ID or CSV data." });
    }

    const rows = [];
    const stream = require("stream");
    const readable = new stream.Readable();
    readable._read = () => { };
    readable.push(csvData);
    readable.push(null);

    readable
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        if (rows.length === 0) {
          return res.status(400).json({ success: false, message: "CSV file is empty or missing data." });
        }

        const expenses = [];

        for (let i = 0; i < rows.length; i++) {
          const { Date, Category, Description, Amount } = rows[i];

          console.log(`Row ${i + 1} -> Date: ${Date}, Category: ${Category}, Description: ${Description}, Amount: ${Amount}`);

          if (!Date || !Category || !Description || !Amount) {
            console.error(`Skipping row ${i + 1} due to missing fields.`);
            continue;
          }
          const parsedDate = moment(Date, ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"], true);

          if (!parsedDate.isValid()) {
            console.error(`Invalid date format for row ${i + 2}:`, Date);
            return res.status(400).json({
              success: false,
              message: `Invalid date format in row ${i + 2}: "${Date}". Expected format: YYYY-MM-DD.`,
            });
          }

          expenses.push({
            projectId,
            description: Description.trim(),
            amount: parseFloat(Amount.trim()),
            date: parsedDate.toDate(),
            category: Category.trim(),
          });
        }

        await Expense.insertMany(expenses);

        res.status(200).json({ success: true, message: "Expenses uploaded successfully!", added: expenses.length });
      });
  } catch (error) {
    console.error("Error uploading expenses:", error);
    res.status(500).json({ success: false, message: "Server error while uploading expenses." });
  }
});

router.get("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expenses = await Expense.find({ projectId: id });
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/delete-expense/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ success: false, msg: "Expense not found" });
    }

    res.json({ success: true, msg: "expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
});

// Update an expense by ID
router.put("/edit-expense/:expenseId", async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("Expense ID:", req.params.expenseId); // Corrected logging

    const { description, amount, category } = req.body;
    const { expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $set: { description, amount, category } },
      { new: true, runValidators: true } // Return updated doc & validate
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    console.log("Updated Expense:", updatedExpense);
    res.status(200).json({ message: "Expense updated successfully", updatedExpense });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;