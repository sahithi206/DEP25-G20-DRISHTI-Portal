/*
 * This file contains the routes for handling Statement of Expenditure (SE) operations.
 * It includes endpoints for submitting, updating, and retrieving SE details.
 */

const express = require("express");
const SE = require("../Models/se/SE");
const { fetchInstitute } = require("../MiddleWares/fetchInstitute");
const router = express.Router();
const { fetchAdmin } = require("../MiddleWares/fetchAdmin.js");


// // Submit SE (PI sends for approval)
// router.post("/submit", async (req, res) => {
//     try {
//         const {
//             projectId,
//             name,
//             scheme,
//             currentYear,
//             startDate,
//             endDate,
//             TotalCost,
//             budgetSanctioned,
//             totalExp,
//             balance,
//             piSignature,
//             institute
//         } = req.body;

//         console.log("Incoming SE data:", req.body);

//         const newSE = new SE({
//             projectId,
//             name,
//             scheme,
//             currentYear,
//             startDate,
//             endDate,
//             TotalCost,
//             budgetSanctioned,
//             totalExp,
//             balance,
//             piSignature,
//             institute,
//             status: "pending", // Use the status field from schema
//             submissionDate: new Date()
//         });

//         await newSE.save();
//         console.log("SE saved successfully");
//         res.status(201).json({ success: true, data: newSE });
//     } catch (err) {
//         console.error("Error saving SE:", err);
//         res.status(500).json({ success: false, message: err.message, id: newSe._id });
//     }
// });

// Get all pending SEs for institute approval
router.get("/pending", fetchInstitute, async (req, res) => {
    try {
        const instituteName = req.institute.college; // or req.institute.name if nested
        console.log("INSTITUTE:", instituteName);

        const pendingSE = await SE.find({
            status: { $in: ["pending", "pendingByHOI", "approvedByHOI"] },
            institute: instituteName
        });

        res.json({ success: true, data: pendingSE });
    } catch (err) {
        console.error("Error fetching pending SEs:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

//Get all pendingByHOI SEs
router.get("/pendingByHoi", fetchInstitute, async (req, res) => {
    try {
        const instituteName = req.institute.college; // or req.institute.name if nested
        console.log("INSTITUTE HOI:", instituteName);

        const pendingByHOI = await SE.find({
            status: "pendingByHOI",
            institute: instituteName
        });

        console.log("Pending HOI Sign:", pendingByHOI);

        res.json({ success: true, data: pendingByHOI });
    } catch (err) {
        console.error("Error fetching pendingByHOI SEs:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Approve a SE (by institute)
router.put("/approve/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { instituteStamp, authSignature } = req.body;

        if (!instituteStamp || !authSignature) {
            return res.status(400).json({ success: false, message: "All signatures are required" });
        }

        const updatedSE = await SE.findByIdAndUpdate(
            id,
            {
                status: "approvedByInst", // Update status to approvedByInst
                instituteStamp,
                authSignature,
                date: new Date()
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

router.get("/latest", async (req, res) => {
    try {
        const { projectId } = req.query;

        console.log("Incoming projectId:", projectId);

        if (!projectId) {
            return res.status(400).json({ success: false, message: "Project ID is required" });
        }

        const se = await SE.findOne({ projectId })

        if (!se) {
            return res.status(404).json({ success: false, message: "No SE found for this project" });
        }

        res.status(200).json({ success: true, data: se });
    } catch (error) {
        console.error("Error fetching latest SE:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.put("/send-to-head/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { authSignature } = req.body;

        if (!authSignature) {
            return res.status(400).json({ success: false, message: "Auth Sign is required" });
        }

        const updatedSE = await SE.findByIdAndUpdate(
            id,
            {
                status: "pendingByHOI",
                authSignature,
                approvalDate: new Date()
            },
            { new: true }
        );

        if (!updatedSE) {
            return res.status(404).json({ success: false, message: "UC Request not found" });
        }
        res.json({ success: true, data: updatedSE });
    } catch (err) {
        console.error("Error approving UC:", err);
        res.status(500).json({ success: false, message: "Server error during approval" });
    }
});

router.put("/head-approval/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { instituteStamp } = req.body;

        if (!instituteStamp) {
            return res.status(400).json({ success: false, message: "Institute stamp is required" });
        }

        const updatedSE = await SE.findByIdAndUpdate(
            id,
            {
                status: "approvedByHOI",
                instituteStamp,
                approvalDate: new Date()
            },
            { new: true }
        );

        if (!updatedSE) {
            return res.status(404).json({ success: false, message: "UC Request not found" });
        }

        res.json({ success: true, data: updatedSE });
    } catch (err) {
        console.error("Error approving UC:", err);
        res.status(500).json({ success: false, message: "Server error during approval" });
    }
});

// Get SE by projectId
router.get("/:projectId", async (req, res) => {
    try {
        const se = await SE.find({ projectId: req.params.projectId });

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

router.get("/get-se/:Id", fetchInstitute, async (req, res) => {
    try {

        const se = await SE.findById(req.params.Id);
        console.log(req.params.Id);
        console.log(se);

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

        const projectSEs = await SE.find({ name }).sort({ submissionDate: -1 });

        if (!projectSEs.length) {
            return res.status(404).json({ success: false, message: "No SE found for this project" });
        }

        res.json({ success: true, data: projectSEs });
    } catch (err) {
        console.error("Error fetching project SEs:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.get("/institute/:institute", async (req, res) => {
    try {
        const { institute } = req.params;

        const instituteSEs = await SE.find({ institute }).sort({ submissionDate: -1 });

        res.json({ success: true, data: instituteSEs });
    } catch (err) {
        console.error("Error fetching institute SEs:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.put("/send-to-admin/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const seRequest = await SE.findById(id);

        if (!seRequest) {
            return res.status(404).json({ success: false, message: "SE request not found" });
        }

        if (seRequest.status !== "approvedByInst") {
            return res.status(400).json({ success: false, message: "SE is not approved by the institute" });
        }

        console.log("SE REQUEST....:", seRequest);

        seRequest.status = "pendingAdminApproval";
        await seRequest.save();

        res.status(200).json({ success: true, message: "SE sent to admin for approval" });
    } catch (error) {
        console.error("Error sending SE to admin:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;