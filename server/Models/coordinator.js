const mongoose = require("mongoose");

const CoordinatorSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    userRole: {
        type: String,
        enum: ["head_coordinator", "coordinator"],
        required: true,
    },
});

module.exports = mongoose.model("Coordinator", CoordinatorSchema);
