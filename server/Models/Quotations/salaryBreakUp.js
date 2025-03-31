const mongoose = require('mongoose');

const SalaryComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Monthly Emol.', 'HRA (Monthly)', 'Medical Allowances (Yearly)']
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  months: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  }
});

const YearlyBreakupSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    match: /^Year \d+$/
  },
  components: [SalaryComponentSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const SalaryBreakupSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  yearlyBreakups: [YearlyBreakupSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SalaryBreakup', SalaryBreakupSchema);