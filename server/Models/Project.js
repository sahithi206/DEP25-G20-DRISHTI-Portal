const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    Scheme:{type:String,required:true},
    Title:{type:String,required:true},
    PI:[{type:String,required:true}],
    CoPI:[{type:String,required:true}],
    years:{type:Number,required:true},
    currentYear:{type:Number,required:true},
    startDate:{type:String,required:true},
    endDate:{type:String,required:true},
    TotalCost:{type:Number,required:true},
    TotalUsed:{type:Number,default:0},
    budgetTotal:{
        nonRecurring:{type:Number,required:true},
        recurring:{
            human_resources:{type:Number,required:true},
            consumables:{type:Number,required:true},
            others:{type:Number,required:true},
            total:{type:Number,required:true}
        },
        yearTotal:{type:Number,required:true},
    },
    CarryForward:{
        nonRecurring:{type:Number,default:0},
        recurring:{
            human_resources:{type:Number,default:0},
            consumables:{type:Number,default:0},
            others:{type:Number,default:0},
            total:{type:Number,default:0}
        },
        yearTotal:{type:Number,required:true},
    },
    generalInfoId:{ type: Schema.Types.ObjectId, ref: "GeneralInfo", required: true },
    bankDetailsId:{ type: Schema.Types.ObjectId, ref: "BankDetails", required: true },
    researchDetailsId:{ type: Schema.Types.ObjectId, ref: "ResearchDetails", required: true },
    PIDetailsId:{ type: Schema.Types.ObjectId, ref: "PI", required: true },
    YearlyDataId:[{ type: Schema.Types.ObjectId, ref: "YearlyData", required: true }],
});

module.exports = mongoose.model("Project", projectSchema);
