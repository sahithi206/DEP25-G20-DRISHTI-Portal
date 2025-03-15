const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const instituteSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, required: true }
});

module.exports = mongoose.model("Institute", instituteSchema);