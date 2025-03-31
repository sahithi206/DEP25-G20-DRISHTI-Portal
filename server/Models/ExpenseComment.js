const mongoose = require("mongoose");
const expenseCommentSchema = new mongoose.Schema(
    {
        expenseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        role: {
            type: String,
            enum: ["PI", "Institute"],
            required: true,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
);

module.exports = mongoose.model("ExpenseComment", expenseCommentSchema);