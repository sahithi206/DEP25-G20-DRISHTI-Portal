const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const ExpenseComment = require("../Models/ExpenseComment");
const Expense = require("../Models/expense");
const User = require("../Models/user");
const institute = require("../Models/instituteID");
const { fetchUser } = require("../Middlewares/fetchUser");
const { fetchInstitute } = require("../Middlewares/fetchInstitute");

// ✅ Add an Expense Comment
router.post("/add", async (req, res) => {
    try {
        let userId = null;
        let role = null;
        console.log("Received accessToken:", req.header("accessToken"));
        if (req.header("accessToken")) {
            try {
                await fetchUser(req, res, () => { });
                userId = req.user._id;
                role = "PI";
            } catch (userError) {
                try {
                    await fetchInstitute(req, res, () => { });
                    userId = req.institute._id;
                    role = "Institute";
                } catch (instituteError) {
                    console.error("Error fetching user or institute:", instituteError);
                }
            }
        }

        console.log("role:", role, "Role:", userId);

        console.log("req:", req.body)

        const { expenseId, comment } = req.body;
        if (!expenseId || !comment || !role) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }


        const newComment = new ExpenseComment({
            expenseId,
            userId,
            role,
            comment,
        });

        await newComment.save();
        res.status(201).json({ success: true, message: "Comment added successfully", data: newComment });
    } catch (error) {
        console.error("Error adding expense comment:", error.message);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// ✅ Get Comments by Expense ID
router.get("/:expenseId", async (req, res) => {
    try {
        const { expenseId } = req.params;

        // Fetch comments and populate userId based on role
        const comments = await ExpenseComment.find({ expenseId }).lean(); // Use .lean() to return plain JS objects

        console.log("COMMENTS Before::", comments);

        // Populate user details dynamically based on role
        await Promise.all(
            comments.map(async (comment) => {
                if (comment.role === "PI") {
                    const userDetails = await mongoose.model("users").findById(comment.userId).lean();
                    comment.userName = userDetails ? userDetails.Name : "Unknown";
                } else if (comment.role === "Institute") {
                    const instituteDetails = await mongoose.model("Institute").findById(comment.userId).lean();
                    comment.userName = instituteDetails ? instituteDetails.college : "Unknown College";
                }
            })
        );

        console.log("COMMENTS After::", comments);

        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        console.error("Error fetching comments:", error.message);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});




// ✅ Get Comments by User ID
router.get("/user/:userId", fetchUser, async (req, res) => {
    try {
        const { userId } = req.params;

        const comments = await ExpenseComment.find({ userId }).populate("expenseId", "name amount");
        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        console.error("Error fetching user comments:", error.message);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// ✅ Delete Comment (Only Author or Admin)
router.delete("/:commentId", fetchUser, async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await ExpenseComment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        // Ensure only the author or an admin can delete
        if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
        }

        await ExpenseComment.findByIdAndDelete(commentId);
        res.status(200).json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error.message);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

module.exports = router;
