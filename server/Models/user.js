const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    role: [{ type: String}],
    email: { type: String, required: true,unique:true },
    password: { type: String, required: true },
    Name: { type: String, required: true },
    Institute: { type: String, required: true },
    DOB: { type: String, required: true },
    Mobile: { type: String, required: true },
    Gender: { type: String, required: true },
    address: { type: String, required: true },
    Dept: { type: String, required: true },
    idType: { type: String, required: true },
    idNumber: { type: String, required: true, unique: true },
    proposals: [
          { type: String, required: true },
    ]
});

module.exports = mongoose.model("users", userSchema);
