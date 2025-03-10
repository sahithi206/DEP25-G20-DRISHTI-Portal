const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    Name: {
        type: String,
        required: true
    },
    Institute: {
        type: String,
        required: true
    },
    DOB: {
        type: String,
        required: true
    },
    Mobile: {
        type: String,
        required: true
    },
    Gender: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    idType: {
        type: String,
        required: true
    },
    idNumber: {
        type: String,
        required: true,
        unique: true
    },
    proposals: [
        {
            ProposalId: { type: String, required: true },
            Scheme: { type: String }
        }
    ]
});

module.exports = mongoose.model("User", userSchema);