const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    requestType: {
        type: String,
        required: true,
        enum: ["Technical Support", "Document Request", "Other"], 
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comments: {
        type: [String],
        default: "",
    },
});

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;