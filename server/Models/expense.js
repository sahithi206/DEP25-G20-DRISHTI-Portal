const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    committedDate: {
        type: Date,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


// const ExpenseSchema = new mongoose.Schema({
//     projectId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Project" },
//     description: { type: String, required: true },
//     amount: { type: Number, required: true },
//     date: { type: Date, required: true },
//     committedDate: { type: Date, required: true },
//     type: {
//       type: String,
//       enum: ["human_resources", "travel", "consumables", "overhead", "others", "equipment", "material", "contingency"],
//       required: true
//     }
//   }, { timestamps: true });

// const expenseSchema = new mongoose.Schema({
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Project',
//       required: true
//     },
//     date: {
//       type: Date,
//       required: true
//     },
//     committedDate: {
//       type: Date,
//       required: true
//     },
//     description: {
//       type: String,
//       required: true
//     },
//     amount: {
//       type: Number,
//       required: true
//     },
//     type: {
//       type: String,
//       enum: ['human_resources', 'travel', 'consumables', 'overhead', 'others', 'equipment', 'material', 'contingency'],
//       required: true
//     }
//   });

module.exports = mongoose.model("Expense", ExpenseSchema);
