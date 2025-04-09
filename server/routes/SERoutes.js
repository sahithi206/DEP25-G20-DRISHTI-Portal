const express = require("express");
const SERequest = require("../Models/se/SE");
const { fetchInstitute } = require("../Middlewares/fetchInstitute");
const router = express.Router();

// Submit SE (PI sends for approval)
router.post("/submit", async (req, res) => {
    try {
        const {
            projectId,
            name,
            scheme,
            currentYear,
            startDate,
            endDate,
            TotalCost,
            budgetSanctioned,
            totalExp,
            balance,
            piSignature,
            institute
        } = req.body;

        console.log("Incoming SE data:", req.body);

        const newSE = new SERequest({
            projectId,
            name,
            scheme,
            currentYear,
            startDate,
            endDate,
            TotalCost,
            budgetSanctioned,
            totalExp,
            balance,
            piSignature,
            institute,
            status: "pending", // Use the status field from schema
            submissionDate: new Date()
        });

        await newSE.save();
        console.log("SE saved successfully");
        res.status(201).json({ success: true, data: newSE });
    } catch (err) {
        console.error("Error saving SE:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all pending SEs for institute approval
router.get("/pending", fetchInstitute, async (req, res) => {
    try {
        const instituteName = req.institute.college; // or req.institute.name if nested
        console.log("INSTITUTE:", instituteName);

        const pendingSE = await SERequest.find({
            status: "pending",
            institute: instituteName
        });

        res.json({ success: true, data: pendingSE });
    } catch (err) {
        console.error("Error fetching pending SEs:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Approve a SE (by institute)
router.put("/approve/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { instituteStamp } = req.body;

        if (!instituteStamp) {
            return res.status(400).json({ success: false, message: "Institute stamp is required" });
        }

        const updatedSE = await SERequest.findByIdAndUpdate(
            id,
            {
                status: "approvedByInst", // Update status to approvedByInst
                instituteStamp,
                approvedDate: new Date()
            },
            { new: true }
        );

        if (!updatedSE) {
            return res.status(404).json({ success: false, message: "SE Request not found" });
        }

        res.json({ success: true, data: updatedSE });
    } catch (err) {
        console.error("Error approving SE:", err);
        res.status(500).json({ success: false, message: "Server error during approval" });
    }
});

// Get SE by projectId
router.get("/:projectId", async (req, res) => {
    try {
        const se = await SERequest.findOne({ projectId: req.params.projectId });

        if (!se) {
            return res.status(404).json({ success: false, message: "No SE record found for this projectId" });
        }

        console.log("SE DATA:", se);
        res.json({ success: true, data: se });
    } catch (err) {
        console.error("Error fetching SE by projectId:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// Get all SEs for a project by name
router.get("/project/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const projectSEs = await SERequest.find({ name }).sort({ submissionDate: -1 });

        if (!projectSEs.length) {
            return res.status(404).json({ success: false, message: "No SE found for this project" });
        }

        res.json({ success: true, data: projectSEs });
    } catch (err) {
        console.error("Error fetching project SEs:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get latest SE for a project (either pending or approved)
router.get("/latest/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const latestSE = await SERequest.findOne({ name }).sort({ submissionDate: -1 });

        if (!latestSE) {
            return res.status(404).json({ success: false, message: "No SE found for this project" });
        }

        res.json({ success: true, data: latestSE });
    } catch (err) {
        console.error("Error fetching latest SE:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get all SEs by institute
router.get("/institute/:institute", async (req, res) => {
    try {
        const { institute } = req.params;

        const instituteSEs = await SERequest.find({ institute }).sort({ submissionDate: -1 });

        res.json({ success: true, data: instituteSEs });
    } catch (err) {
        console.error("Error fetching institute SEs:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;