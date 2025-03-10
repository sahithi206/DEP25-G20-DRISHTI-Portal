const mongoose = require("mongoose");

const SchemeSchema = new mongoose.Schema({
  name: String,
  description: String
});

module.exports = mongoose.model("Scheme", SchemeSchema);
