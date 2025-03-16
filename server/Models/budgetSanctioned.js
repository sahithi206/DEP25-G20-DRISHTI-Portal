const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const budgetSchema = new Schema({
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
    TotalCost:{type:Number,required:true},
    budgetSanctioned:{
        nonRecurring:{type:Number,required:true},
        recurring:{
            human_resources:{type:Number,required:true},
            consumables:{type:Number,required:true},
            others:{type:Number,required:true},
            total:{type:Number,required:true}
        },
        yearTotal:{type:Number,required:true},
    },
});

module.exports = mongoose.model("budgetSanctioned", budgetSchema);