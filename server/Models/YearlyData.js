const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const YearlySchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    budgetUnspent:{type:Number,default:0},
    budgetSanctioned:{
        overhead:{type:Number,required:false},
        nonRecurring:{type:Number,required:false},
        recurring:{
            human_resources:{type:Number,required:false},
            travel:{type:Number,required:false},
            consumables:{type:Number,required:false},
            others:{type:Number,required:false},
            total:{type:Number,required:true}
        },
        yearTotal:{type:Number,required:true},
    },
    budgetUsed:{
        overhead:{type:Number,default:0},
        nonRecurring:{type:Number,default:0},
        recurring:{
            human_resources:{type:Number,default:0},
            travel:{type:Number,default:0},
            consumables:{type:Number,default:0},
            others:{type:Number,default:0},
            total:{type:Number,default:0}
        },
        yearTotal:{type:Number,default:0},
    },
    progressReport:{ type: Schema.Types.ObjectId, ref: "Report"}
});

module.exports = mongoose.model("YearlyData", YearlySchema);