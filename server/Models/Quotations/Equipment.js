const mongoose = require('mongoose');

// Equipment Schema
const EquipmentSchema = new mongoose.Schema({
 projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
   QuotationId:{ type: mongoose.Schema.Types.ObjectId, ref: "Quotation"},
  equipments: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      cost: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: false,
      },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
