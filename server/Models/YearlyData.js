const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const YearlySchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    budgetUnspent:{type:Number,default:0},
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
    budgetUsed:{
        nonRecurring:{type:Number},
        recurring:{
            human_resources:{type:Number},
            consumables:{type:Number},
            others:{type:Number},
            total:{type:Number}
        },
        yearTotal:{type:Number},
    },
    progressReport:{ type: Schema.Types.ObjectId, ref: "Report"}
});

module.exports = mongoose.model("YearlyData", YearlySchema);