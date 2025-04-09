// routes/ucRoutes.js
import express from "express";
const UcRequest = require("../Models/UCRequest");

const router = express.Router();

// Submit UC (PI sends for approval)
router.post("/submit", async (req, res) => {
    try {
        const newUc = new UcRequest(req.body);
        await newUc.save();
        res.status(201).json({ success: true, data: newUc });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all pending UCs
router.get("/pending", async (req, res) => {
    try {
        const pending = await UcRequest.find({ status: "pending" });
        res.json({ success: true, data: pending });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Approve a UC (by institute)
router.put("/approve/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { instituteStamp } = req.body;
        const uc = await UcRequest.findByIdAndUpdate(
            id,
            {
                status: "approved",
                instituteStamp,
                approvalDate: new Date()
            },
            { new: true }
        );
        res.json({ success: true, data: uc });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get approved UC by projectId/type
router.get("/approved", async (req, res) => {
    const { projectId, type } = req.query;
    try {
        const approved = await UcRequest.findOne({
            projectId,
            type,
            status: "approved"
        });
        res.json({ success: true, data: approved });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
