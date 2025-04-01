const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  bank: {
    name: { type: String, required: true },
    number: { type: String, required: true },
    Ifsc: { type: String, required: true },
    address: { type: String, required: true },
    bankName: { type: String, required: true }
  },
  equipmentsId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true,
  },
  salaryBreakUpId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryBreakUp',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Quotation', QuotationSchema);
