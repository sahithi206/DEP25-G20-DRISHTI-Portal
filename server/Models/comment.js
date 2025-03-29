const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    certificateId: { type: Schema.Types.ObjectId, required: true },
    comment: { type: String, required: true },
    type: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" }, 
});

module.exports = mongoose.model("Comment", commentSchema);
