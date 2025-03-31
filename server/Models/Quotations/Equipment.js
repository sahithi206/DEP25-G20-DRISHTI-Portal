const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  make: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  imported: {
    type: String,
    required: true,
    enum: ['Y', 'N'],
    uppercase: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  remarks: {
    type: String,
    trim: true
  },
  quotationFile: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Equipment', EquipmentSchema);