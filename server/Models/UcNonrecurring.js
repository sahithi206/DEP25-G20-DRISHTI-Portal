const mongoose = require("mongoose");
const NonRecurringGrantSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title:{type:String,required:true},
    scheme:{type:String,required:true},
    currentYear: { type: Number, required: true },
    startDate:{type:String,required:true},
    endDate:{type:String,required:true},
    type:{type:String,required:true},
    carryForward: { type: Number, required: true, default: 0 },
    yearTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    recurringExp:{type:Number,default:0},
    nonRecurringExp:{type:Number,required:true},
    status: { type: String, required: true, default: "Pending for institute approval." }, 

});

module.exports =  mongoose.model("NonRecurringUC", NonRecurringGrantSchema);