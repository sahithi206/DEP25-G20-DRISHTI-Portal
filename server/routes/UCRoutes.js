const express = require("express");
const UCRequest = require("../Models/UCRequest");
const { fetchInstitute } = require("../MddleWares/fetchInstitute");
const router = express.Router();

// Submit UC (PI sends for approval)
router.post("/submit", async (req, res) => {
    try {
        const { projectId, type, ucData, piSignature, submissionDate, status } = req.body;

        console.log("Incoming UC data:", req.body);
        const newUc = new UCRequest({
            projectId,
            type,
            ucData,
            piSignature,
            submissionDate,
            status
        });
        const ucSaved = await newUc.save();
        console.log("Saved successfully");
        res.status(201).json({ success: true, data: newUc, ucId: ucSaved._id, });
    } catch (err) {
        console.error("Error saving UC:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all pending UCs
router.get("/pending", fetchInstitute, async (req, res) => {
    try {
        const instituteName = req.institute.college; // or req.institute.name if nested
        console.log("INSTITUE:", instituteName);
        const pending = await UCRequest.find({
            status: "pending",
            "ucData.instituteName": instituteName
        });

        res.json({ success: true, data: pending });
    } catch (err) {
        console.error("Error fetching pending UCs:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Approve a UC (by institute)
router.put("/approve/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { instituteStamp } = req.body;

        if (!instituteStamp) {
            return res.status(400).json({ success: false, message: "Institute stamp is required" });
        }

        const updatedUC = await UCRequest.findByIdAndUpdate(
            id,
            {
                status: "approvedByInst",
                instituteStamp,
                approvalDate: new Date()
            },
            { new: true }
        );

        if (!updatedUC) {
            return res.status(404).json({ success: false, message: "UC Request not found" });
        }

        res.json({ success: true, data: updatedUC });
    } catch (err) {
        console.error("Error approving UC:", err);
        res.status(500).json({ success: false, message: "Server error during approval" });
    }
});

// Get approved UC by projectId/type
router.get("/approved", async (req, res) => {
    try {
        const { projectId, type } = req.query;

        if (!projectId || !type) {
            return res.status(400).json({ success: false, message: "Missing projectId or type" });
        }

        const approvedUC = await UCRequest.findOne({
            projectId,
            type,
            status: "approved"
        });

        if (!approvedUC) {
            return res.status(404).json({ success: false, message: "No approved UC found" });
        }

        res.json({ success: true, data: approvedUC });

    } catch (err) {
        console.error("Error fetching approved UC:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get latest UC (either pending or approved)
router.get("/latest", async (req, res) => {
    try {
        const { projectId, type } = req.query;

        if (!projectId || !type) {
            return res.status(400).json({ success: false, message: "Missing projectId or type" });
        }

        const latestUC = await UCRequest.findOne({ projectId, type }).sort({ submissionDate: -1 });

        if (!latestUC) {
            return res.status(404).json({ success: false, message: "No UC found" });
        }

        res.json({ success: true, data: latestUC });
    } catch (err) {
        console.error("Error fetching UC:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.put("/send-to-admin/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const ucRequest = await UCRequest.findById(id);
  
      if (!ucRequest) {
        return res.status(404).json({ success: false, message: "UC request not found" });
      }
  
      if (ucRequest.status !== "approvedByInst") {
        return res.status(400).json({ success: false, message: "UC must be approved by the institute first" });
      }
  
      ucRequest.status = "pendingAdminApproval";
      await ucRequest.save();
  
      res.status(200).json({ success: true, message: "UC sent to admin for approval" });
    } catch (error) {
      console.error("Error sending UC to admin:", error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  router.put("/admin-approval/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body; 
  
      const ucRequest = await UCRequest.findById(id);
  
      if (!ucRequest) {
        return res.status(404).json({ success: false, message: "UC request not found" });
      }
  
      if (ucRequest.status !== "pendingAdminApproval") {
        return res.status(400).json({ success: false, message: "UC is not pending admin approval" });
      }
  
      if (action === "approve") {
        ucRequest.status = "approvedByAdmin";
        ucRequest.approvalDate = new Date();
      } else if (action === "reject") {
        ucRequest.status = "rejectedByAdmin";
      } else {
        return res.status(400).json({ success: false, message: "Invalid action" });
      }
  
      await ucRequest.save();
  
      res.status(200).json({ success: true, message: `UC ${action}d by admin` });
    } catch (error) {
      console.error("Error during admin approval:", error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

module.exports = router;