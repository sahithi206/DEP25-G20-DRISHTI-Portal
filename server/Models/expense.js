const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project ID is required"],
    },

    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        minlength: [5, "Description must be at least 5 characters long"],
        maxlength: [500, "Description must be less than 500 characters"],
    },

    committedDate: {
        type: Date,
        required: [true, "Committed Date is required"],
        validate: {
            validator: function (v) {
                return v instanceof Date && !isNaN(v);
            },
            message: "Invalid committed date",
        },
    },

    date: {
        type: Date,
        default: null,
        validate: {
            validator: function (v) {
                if (!v) return true;
                return this.committedDate && v >= this.committedDate;
            },
            message: "Transaction date must be on or after the committed date",
        },
    },

    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount must be greater than or equal to 0"],
        validate: {
            validator: function (v) {
                return !isNaN(v);
            },
            message: "Amount must be a valid number",
        },
    },


    type: {
        type: String,
        required: [true, "Expense type is required"],
        trim: true,
        validate: {
            validator: function (v) {
                return typeof v === "string" && v.trim().length > 0;
            },
            message: "Type must be a non-empty string",
        },
    },

    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
});

module.exports = mongoose.model("Expense", ExpenseSchema);
