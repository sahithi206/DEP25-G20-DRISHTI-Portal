const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },  
  salaryBreakUpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryBreakup'
  },
 equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'submitted', 'approved', 'rejected', 'ordered'],
    default: 'Pending'
  },
  bank:{ name: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: String,
    required: true,
    trim: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  Ifsc: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },}
 
});

QuotationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

QuotationSchema.index({ projectId: 1 });
QuotationSchema.index({ status: 1 });

module.exports = mongoose.model('Quotation', QuotationSchema);