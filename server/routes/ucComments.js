const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const router = express.Router();
const UCComment = require("../Models/UCComment");
const { fetchUser } = require("../MddleWares/fetchUser");
const { fetchInstitute } = require("../MddleWares/fetchInstitute");

router.post("/add", async (req, res, next) => {
  try {
    let userId = null;
    let role = null;

    if (req.header("accessToken")) {
      try {
        await fetchUser(req, res, () => { });
        userId = req.user._id;
        role = "PI";
      } catch (userError) {
        await fetchInstitute(req, res, () => { });
        userId = req.institute._id;
        role = "Institute";
      }
    }

    const { projectId, ucType, comment } = req.body;
    if (!projectId || !ucType || !comment || !role) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newComment = new UCComment({
      projectId,
      ucType,
      userId,
      role,
      comment,
    });

    await newComment.save();
    res.status(201).json({ success: true, message: "Comment added successfully", data: newComment });
  } catch (error) {
    console.error("Error adding UC comment:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/:projectId/:ucType", async (req, res) => {
  try {
    const { projectId, ucType } = req.params;
    console.log("Fetching comments for projectId:", projectId, "ucType:", ucType);

    const comments = await UCComment.find({ projectId, ucType }).populate("userId", "Name email");
    // if (!mongoose.Types.ObjectId.isValid(projectId)) {
    //   console.error("Invalid projectId:", projectId);
    //   return res.status(400).json({ success: false, message: "Invalid projectId" });
    // }

    // const comments = await UCComment.find({
    //   projectId: mongoose.Types.ObjectId(projectId),
    //   ucType,
    // }).populate("userId", "Name email");
    

    console.log("Query result:", comments);


    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error("Error fetching UC comments:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/userUCcomment/:userId", fetchUser, async (req, res) => {
  try {
    const { userId } = req.params;

    const comments = await UCComment.find({ userId }).populate("projectId", "title scheme");
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error("Error fetching user comments:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.delete("/:commentId", fetchUser, async (req, res) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await UCComment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;