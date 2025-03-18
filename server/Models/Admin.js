const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["Head Coordinator", "Coordinator"], // Only allows these two values
            required: true,
            default: "Coordinator"
        }
    },
    { timestamps: true }  // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("Admin", AdminSchema);
