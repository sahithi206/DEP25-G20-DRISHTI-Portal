const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const proposalSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    status: { type: String, enum: ["Unsaved","Sanctioned","Pending", "Approved", "Rejected"], required: true },
    comments: [
        {
          text: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        }
      ],
    Scheme:{ type: Schema.Types.ObjectId, ref: "Scheme", required: true}
});



module.exports = mongoose.model("Proposal", proposalSchema);
