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
        overhead:{type:Number,required:true},
        nonRecurring:{type:Number,required:true},
        recurring:{
            overhead:{type:Number,required:true},
            human_resources:{type:Number,required:true},
            travel:{type:Number,required:true},
            consumables:{type:Number,required:true},
            others:{type:Number,required:true},
            total:{type:Number,required:true}
        },
        total:{type:Number,required:true},
    },
    CarryForward:{
        overhead:{type:Number,required:true},
        nonRecurring:{type:Number,default:0},
        recurring:{
            human_resources:{type:Number,required:true},
            travel:{type:Number,required:true},
            consumables:{type:Number,required:true},
            others:{type:Number,required:true},
            total:{type:Number,required:true}
        },
        yearTotal:{type:Number,default:0},
    },
    generalInfoId:{ type: Schema.Types.ObjectId, ref: "GeneralInfo", required: true },
    bankDetailsId:{ type: Schema.Types.ObjectId, ref: "BankDetails", required: true },
    researchDetailsId:{ type: Schema.Types.ObjectId, ref: "ResearchDetails", required: true },
    PIDetailsId:{ type: Schema.Types.ObjectId, ref: "PI", required: true },
    YearlyDataId:[{ type: Schema.Types.ObjectId, ref: "YearlyData", required: true }],
});

module.exports = mongoose.model("Project", projectSchema);
