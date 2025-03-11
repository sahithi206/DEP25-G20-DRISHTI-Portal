const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    requestType: {
        type: String,
        required: true,
        enum: ["Technical Support", "Document Request", "Other"], // Add more types if needed
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
});

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
