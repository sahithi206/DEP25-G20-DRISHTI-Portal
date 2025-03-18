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
        nonRecurring:{type:Number,default:0},
        recurring:{
            human_resources:{type:Number,default:0},
            consumables:{type:Number,default:0},
            others:{type:Number,default:0},
            total:{type:Number,default:0}
        },
        yearTotal:{type:Number,default:0},
    },
    progressReport:{ type: Schema.Types.ObjectId, ref: "Report"}
});

module.exports = mongoose.model("YearlyData", YearlySchema);