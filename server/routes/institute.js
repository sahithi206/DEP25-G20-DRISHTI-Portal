const express = require("express");
const router = express.Router();
const Proposal = require("../Models/Proposal");
const User = require("../Models/user");
const GeneralInfo = require("../Models/General_Info");
const ResearchDetails = require("../Models/researchDetails");
const Institute = require("../Models/instituteID");
const Project = require("../Models/Project.js");
const PI = require("../Models/PI");
const Expense = require("../Models/expense.js");
const csv = require("csv-parser");
const { fetchInstitute } = require("../Middlewares/fetchInstitute.js");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const moment = require("moment");
const ExcelJS = require('exceljs');
const Scheme = require("../Models/Scheme.js");
const UCRequest = require("../Models/UCRequest.js");
const SE = require("../Models/se/SE.js");
const YearlyData = require("../Models/YearlyData");
router.get("/institute-projects", fetchInstitute, async (req, res) => {
  try {
    const institute = req.institute.college;

    const users = await User.find({ Institute: institute });
    const userIds = users.map(user => user._id);

    const projects = await Project.find({ userId: { $in: userIds }, status: "Ongoing" })
      .populate({ path: 'userId', select: 'Name' })
      .populate({ path: 'Scheme', select: 'name' });
    console.log("Fetched Projects:", projects);
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
    let proj = await Project.find({ userId: req.params.userId });
    if (proj.length <= 0) {
      return res.status(200).json({ success: false, msg: "No Sanctioned Projects" })
    }
    let projects = await Promise.all(
      proj.map(async (proj, idx) => {
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
          let project = await Project.findByIdAndUpdate(proj._id, { status: status }, { new: true });
          proj = project;
        }
        return proj;
      })
    )
    console.log(projects);
    return res.status(200).json({
      success: true, msg: "Sanctioned Projects Fetched Successfully",
      projects
    })
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, msg: "Failed to Fetch Project", error: "Internal Server Error" });
  }
});

router.get("/get-project/:projectid", fetchInstitute, async (req, res) => {
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
    project = await Project.findByIdAndUpdate(id, { status: status }, { new: true });
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

router.get("/sanctioned-projects", fetchInstitute, async (req, res) => {
  try {
    const institute = req.institute.college;
    console.log(req);
    const users = await User.find({ Institute: institute }).select("_id");
    const userIds = users.map(user => user._id);
    console.log("Projects", users, userIds);
    const projects = await Project.find({ userId: { $in: userIds }, status: "Ongoing" }).populate('Scheme');
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
      if (["human_resources", "travel", "consumables", "others"].includes(type)) {
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
      } else if (type === "overhead") {
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
      if (["human_resources", "travel", "consumables", "others"].includes(type)) {
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
      } else if (type === "overhead") {
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
    readable._read = () => { };
    readable.push(csvData);
    readable.push(null);

    const csv = require("csv-parser"); // ensure this is imported

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
        let skipped = 0;

        for (let i = 0; i < rows.length; i++) {
          const { Date, CommittedDate, Description, Amount, Type } = rows[i];

          if (!CommittedDate || !Description || !Amount || !Type) {
            console.error(`Skipping row ${i + 1} due to missing required fields (CommittedDate, Description, Amount, or Type).`);
            skipped++;
            continue;
          }

          const parsedCommittedDate = moment(CommittedDate, ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"], true);
          if (!parsedCommittedDate.isValid()) {
            console.error(`Invalid committedDate format in row ${i + 1}: ${CommittedDate}`);
            skipped++;
            continue;
          }

          let parsedDate = null;
          if (Date && Date.trim()) {
            const tryParseDate = moment(Date, ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"], true);
            if (tryParseDate.isValid()) {
              parsedDate = tryParseDate.toDate();
            } else {
              console.warn(`Invalid optional Date field in row ${i + 1}: ${Date}. Setting it as null.`);
              skipped++;
              continue;
            }
          }

          const expense = new Expense({
            projectId,
            description: Description.trim(),
            amount: parseFloat(Amount),
            date: parsedDate,
            committedDate: parsedCommittedDate.toDate(),
            type: Type.trim()
          });

          try {
            await expense.validate(); // Validate before pushing
            expenses.push(expense);
          } catch (validationErr) {
            console.warn(`Skipping row ${i + 1} — validation failed: ${validationErr.message}`);
            skipped++;
          }

        }

        if (expenses.length === 0) {
          return res.status(400).json({ success: false, message: "No valid expenses to upload. Transaction date must be on or after the committed date" });
        }

        await Expense.insertMany(expenses);

        for (let i = 0; i < expenses.length; i++) {
          await updateBudgetFields(projectId, expenses[i].amount, expenses[i].type, "add");
        }

        res.status(200).json({
          success: true,
          message: "Expenses uploaded successfully!",
          added: expenses.length,
          skipped
        });
      });
  } catch (error) {
    console.error("Error uploading expenses:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Server error while uploading expenses.",
      errorDetails: error.message
    });
  }
});

// Get expenses by project ID
router.get("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let filters = { projectId: id };

    // Apply filters if query parameters are provided
    if (req.query.type) filters.type = req.query.type;
    if (req.query.startDate) filters.date = { $gte: new Date(req.query.startDate) };
    if (req.query.endDate) filters.date = { ...filters.date, $lte: new Date(req.query.endDate) };
    if (req.query.startCommittedDate) filters.committedDate = { $gte: new Date(req.query.startCommittedDate) };
    if (req.query.endCommittedDate) filters.committedDate = { ...filters.committedDate, $lte: new Date(req.query.endCommittedDate) };
    if (req.query.minAmount) filters.amount = { $gte: Number(req.query.minAmount) };
    if (req.query.maxAmount) filters.amount = { ...filters.amount, $lte: Number(req.query.maxAmount) };
    if (req.query.pendingOnly === "true") {
      filters.date = null;
    }

    console.log("Applying Filters:", filters); // Debugging step

    const expenses = await Expense.find(filters).sort({ createdAt: -1 });
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
    const { description, amount, committedDate, type, date } = req.body;
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

    // Update fields manually for full validation to trigger
    existingExpense.description = description;
    existingExpense.amount = amount;
    existingExpense.committedDate = committedDate;
    existingExpense.type = type;
    existingExpense.date = date;

    // This triggers all validations including custom ones
    await existingExpense.save()

    await updateBudgetFields(existingExpense.projectId, oldAmount, oldType, "subtract");
    await updateBudgetFields(existingExpense.projectId, amount, type, "add");

    res.status(200).json({ message: "Expense updated successfully", updatedExpense: existingExpense, });
  } catch (err) {
    console.error("Error updating expense:", err);

    let message = "Failed to update expense";

    // Extract validation errors from Mongoose
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      message = errors.join(", ");
    }

    res.status(400).json({ success: false, message });
  }
});

// Add a single expense
router.post("/add-expense", async (req, res) => {
  try {
    const { projectId, description, amount, date, committedDate, type } = req.body;

    if (!projectId || !description || !amount || !committedDate || !type) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const parsedCommittedDate = moment(committedDate, "YYYY-MM-DD", true);

    if (!parsedCommittedDate.isValid()) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    let parsedDate = null;
    if (date && date.trim()) {
      const tryParseDate = moment(date, ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"], true);
      if (tryParseDate.isValid()) {
        parsedDate = tryParseDate.toDate();
      } else {
        console.warn(`Invalid optional Date field in row ${i + 1}: ${Date}. Setting it as null.`);
      }
    }

    const newExpense = new Expense({
      projectId,
      description,
      amount: parseFloat(amount),
      date: parsedDate,
      committedDate: parsedCommittedDate.toDate(),
      type
    });

    await newExpense.save();

    await updateBudgetFields(projectId, amount, type, "add");

    res.status(201).json({ success: true, message: "Expense added successfully!", newExpense });
  } catch (err) {
    console.error("Error updating expense:", err);

    let message = "Failed to update expense";

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      message = errors.join(", ");
    }

    res.status(400).json({ success: false, message });
  }
});

router.get('/generate-excel-template', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');

    worksheet.addRow(['Date', 'CommittedDate', 'Description', 'Amount', 'Type']);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Expense_Template_Excel.xlsx`);

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error('Excel generation error:', error);
    res.status(500).json({
      message: 'Failed to generate Excel template',
      error: error.message
    });
  }
});

router.post('/upload-expenses', async (req, res) => {
  try {
    const { projectId, csvData } = req.body;

    if (!csvData || csvData.trim() === '') {
      return res.status(400).json({ message: 'CSV data is empty or invalid' });
    }

    const rows = csvData.split('\n');
    const headers = rows[0].split(',');

    const requiredHeaders = ['Date', 'CommittedDate', 'Description', 'Amount', 'Type'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        message: `Missing required headers: ${missingHeaders.join(', ')}`
      });
    }

    const expenses = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');
      if (row.length >= 5 && row[0].trim() !== '') {
        // Map CSV columns to database fields
        const dateIndex = headers.indexOf('Date');
        const committedDateIndex = headers.indexOf('CommittedDate');
        const descriptionIndex = headers.indexOf('Description');
        const amountIndex = headers.indexOf('Amount');
        const typeIndex = headers.indexOf('Type');

        expenses.push({
          projectId,
          date: row[dateIndex].trim(),
          committedDate: row[committedDateIndex].trim(),
          description: row[descriptionIndex].trim(),
          amount: parseFloat(row[amountIndex].trim()),
          type: row[typeIndex].trim()
        });
      }
    }

    // Save expenses to database
    // This depends on your database setup, example shown for MongoDB
    await YourExpenseModel.insertMany(expenses);

    res.status(200).json({
      message: `Successfully uploaded ${expenses.length} expenses`,
      count: expenses.length
    });

  } catch (error) {
    console.error('Error uploading expenses:', error);
    res.status(500).json({ message: 'Failed to upload expenses', error: error.message });
  }
});

router.get("/ucforms/:id", fetchInstitute, async (req, res) => {
  try {
    const recurringgrant = await UCRequest.find({ projectId: req.params.id });
    const grant = await UCRequest.find({ projectId: req.params.id });
    const se = await SE.find({ projectId: req.params.id });

    if (grant.length <= 0 && recurringgrant.length <= 0 && se.length <= 0) {
      return res.status(404).json({ succes: false, msg: "Certificates not found" });
    }

    res.status(200).json({ success: true, grant, se, recurringgrant, msg: "Certificates Fetched" });
  } catch (error) {
    console.error("Error fetching Certificates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get institute profile data, protected by fetchInstitute middleware
router.get('/profile', fetchInstitute, async (req, res) => {
  try {

    // console.log("Inst Details:", req.institute);
    // req.institute contains the institute ID from the JWT token
    const instituteId = req.institute._id;

    // Fetch institute details including user role
    const institute = await Institute.findById(instituteId).select("-password");

    if (!institute) {
      return res.status(404).json({ error: "Institute not found" });
    }

    res.status(200).json({ success: true, institute });
  } catch (error) {
    console.error("Error fetching institute profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;