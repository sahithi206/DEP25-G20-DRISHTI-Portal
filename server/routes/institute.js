
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



async function updateBudgetFields(projectId, amount, type, operation) {
  console.log("updateBudgetFields", projectId, amount, type, operation);
  try {
    const project = await Project.findById(projectId).populate("YearlyDataId");
    if (!project) {
      throw new Error("Project not found");
    }

    const currentYearData = project.YearlyDataId[project.currentYear - 1];
    if (!currentYearData) {
      throw new Error("Yearly data not found for the current year");
    }

    const amountFloat = parseFloat(amount);

    if (operation === "add") {
      if(["human_resources", "travel", "consumables", "others"].includes(type)) {
      currentYearData.budgetUsed.recurring[type] += amountFloat;
      currentYearData.budgetUsed.recurring.total += amountFloat;
      project.budgetTotal.recurring[type] += amountFloat;
      project.budgetTotal.recurring.total += amountFloat;
      project.CarryForward.recurring[type] -= amountFloat;
      project.CarryForward.recurring.total -= amountFloat;

      } else if (["equipment", "material", "contingency"].includes(type)) {
        currentYearData.budgetUsed.nonRecurring += amountFloat;
        project.budgetTotal.nonRecurring += amountFloat;
        project.CarryForward.nonRecurring -= amountFloat;
      } else if(type === "overhead") {
        currentYearData.budgetUsed.overhead += amountFloat; 
        project.budgetTotal.overhead += amountFloat;
        project.CarryForward.overhead -= amountFloat;
      }

      currentYearData.budgetUsed.yearTotal += amountFloat;
      currentYearData.budgetUnspent -= amountFloat;

      project.budgetTotal.total += amountFloat;
      project.CarryForward.yearTotal -= amountFloat;
      project.TotalUsed += amountFloat;
    } else if (operation === "subtract") {
      if(["human_resources", "travel", "consumables", "others"].includes(type)) {
      currentYearData.budgetUsed.recurring[type] -= amountFloat;  
      currentYearData.budgetUsed.recurring.total -= amountFloat;
      project.budgetTotal.recurring[type] -= amountFloat;
      project.budgetTotal.recurring.total -= amountFloat;
      project.CarryForward.recurring[type] += amountFloat;
      project.CarryForward.recurring.total += amountFloat;
      }
      else if (["equipment", "material", "contingency"].includes(type)) {
        currentYearData.budgetUsed.nonRecurring -= amountFloat;
        project.budgetTotal.nonRecurring -= amountFloat;
        project.CarryForward.nonRecurring += amountFloat;
      } else if(type === "overhead") {
        currentYearData.budgetUsed.overhead -= amountFloat; 
        project.budgetTotal.overhead -= amountFloat;
        project.CarryForward.overhead += amountFloat;
      }

      currentYearData.budgetUsed.yearTotal -= amountFloat;
      currentYearData.budgetUnspent += amountFloat;
      project.budgetTotal.total -= amountFloat;
      project.CarryForward.yearTotal += amountFloat;
      project.TotalUsed -= amountFloat;
    }

    await currentYearData.save();
    await project.save();
  } catch (error) {
    console.error("Error updating budget fields:", error);
    throw error;
  }
}


router.post("/upload-expenses", async (req, res) => {
  try {
    const { projectId, csvData } = req.body;

    if (!projectId || !csvData) {
      return res.status(400).json({ success: false, message: "Missing project ID or CSV data." });
    }
    const stream = require("stream");
    const rows = [];
    const readable = new stream.Readable();
    readable._read = () => {};
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
          const { Date, CommittedDate, Description, Amount, Type } = rows[i];

          if (!Date || !CommittedDate || !Description || !Amount || !Type) {
            console.error(`Skipping row ${i + 1} due to missing fields.`);
            continue;
          }

          const parsedDate = moment(Date, ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"], true);
          const parsedCommittedDate = moment(CommittedDate, ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"], true);

          if (!parsedDate.isValid() || !parsedCommittedDate.isValid()) {
            console.error(`Invalid date format in row ${i + 1}: ${Date} or ${CommittedDate}`);
            continue;
          }

          expenses.push({
            projectId,
            description: Description.trim(),
            amount: parseFloat(Amount.trim()),
            date: parsedDate.toDate(),
            committedDate: parsedCommittedDate.toDate(),
            type: Type.trim(),
          });
        }

        if (expenses.length === 0) {
          return res.status(400).json({ success: false, message: "No valid expenses to upload." });
        }

        console.log("Final expenses to insert:", expenses);
        await Expense.insertMany(expenses);

        for (let i = 0; i < expenses.length; i++) {
          await updateBudgetFields(projectId, expenses[i].amount, expenses[i].type, "add");
        }
        
        res.status(200).json({ success: true, message: "Expenses uploaded successfully!", added: expenses.length });
      });
  } catch (error) {
    console.error("Error uploading expenses:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Server error while uploading expenses.", errorDetails: error.message });
  }
});

// Helper function to parse CSV
function parseCSV(csvData) {
  try {
    // Implement CSV parsing logic
    // Could use libraries like csv-parse
    return csvParser.parse(csvData, { columns: true });
  } catch (error) {
    console.error('CSV Parsing Error:', error);
    throw new Error('Failed to parse CSV data');
  }
}

// Get expenses by project ID
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

// Delete an expense by ID
router.delete("/delete-expense/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ success: false, msg: "Expense not found" });
    }

    await updateBudgetFields(deletedExpense.projectId, deletedExpense.amount, deletedExpense.type, "subtract");

    res.json({ success: true, msg: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
});

// Update an expense by ID
router.put("/edit-expense/:expenseId", async (req, res) => {
  try {
    const { description, amount, committedDate, type } = req.body;
    const { expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const existingExpense = await Expense.findById(expenseId);
    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const oldAmount = existingExpense.amount;
    const oldType = existingExpense.type;

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $set: { description, amount, committedDate, type } },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await updateBudgetFields(updatedExpense.projectId, oldAmount, oldType, "subtract");
    await updateBudgetFields(updatedExpense.projectId, amount, type, "add");

    res.status(200).json({ message: "Expense updated successfully", updatedExpense });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a single expense
router.post("/add-expense", async (req, res) => {
  try {
    const { projectId, description, amount, date, committedDate, type } = req.body;

    if (!projectId || !description || !amount || !date || !committedDate || !type) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const parsedDate = moment(date, "YYYY-MM-DD", true);
    const parsedCommittedDate = moment(committedDate, "YYYY-MM-DD", true);

    if (!parsedDate.isValid() || !parsedCommittedDate.isValid()) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    const newExpense = new Expense({
      projectId,
      description,
      amount: parseFloat(amount),
      date: parsedDate.toDate(),
      committedDate: parsedCommittedDate.toDate(),
      type
    });

    await newExpense.save();

    await updateBudgetFields(projectId, amount, type, "add");

    res.status(201).json({ success: true, message: "Expense added successfully!", newExpense });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ success: false, message: "Server error while adding expense." });
  }
});


module.exports = router;