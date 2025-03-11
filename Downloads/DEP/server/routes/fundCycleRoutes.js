const express = require("express");
const FundCycleRequest = require("../Models/FundCycle"); // Import Mongoose Model
const router = express.Router();

// ✅ GET all fund cycle requests
router.get("/", async (req, res) => {
    try {
        const requests = await FundCycleRequest.find();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Error fetching fund cycle requests" });
    }
});

// ✅ POST a new fund cycle request
router.post("/", async (req, res) => {
    const { applicantName, amount, reason } = req.body;

    if (!applicantName || !amount || !reason) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newRequest = new FundCycleRequest({
            applicantName,
            amount,
            reason,
            status: "Pending", // Default status
        });

        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ error: "Error creating fund cycle request" });
    }
});

// ✅ UPDATE fund cycle request status (Approve/Reject)
router.put("/:id", async (req, res) => {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const updatedRequest = await FundCycleRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ error: "Request not found" });
        }

        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: "Error updating request status" });
    }
});

// ✅ DELETE a fund cycle request
router.delete("/:id", async (req, res) => {
    try {
        const deletedRequest = await FundCycleRequest.findByIdAndDelete(req.params.id);

        if (!deletedRequest) {
            return res.status(404).json({ error: "Request not found" });
        }

        res.json({ message: "Request deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting request" });
    }
});

module.exports = router;
