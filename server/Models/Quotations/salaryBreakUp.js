const mongoose = require("mongoose");

const SalarySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  QuotationId:{ type: mongoose.Schema.Types.ObjectId, ref: "Quotation"},
  salary: [{
    designation: { type: String, required: true },
    YearTotal: [{ type: Number, required: true }],
    breakup: [{
      noOfPersons: { type: Number, required: true },
      name: { type: String, required: true },
      value: { type: Number, default: 0 },
      months: { type: Number, default: null },
    }], 
  }],
});

const SalaryBreakUp = mongoose.model("SalaryBreakUp", SalarySchema);

module.exports = SalaryBreakUp;
