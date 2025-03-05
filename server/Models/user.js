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
<<<<<<< HEAD
            ProposalId: { type: String, required: true },
=======
            ProposalId: { type: String},
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
            Scheme: { type: String }
        }
    ]
});

module.exports = mongoose.model("users", userSchema);