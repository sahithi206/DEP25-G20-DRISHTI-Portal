const express = require("express");
const Request = require("../Models/Request");
const router = express.Router();

// Fetch all requests
router.get("/", async (req, res) => {
    try {
        const requests = await Request.find();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/", async (req, res) => {
    try {
        const { requestType, description } = req.body;
        if (!requestType || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const newRequest = new Request({ requestType, description });
        await newRequest.save();

        return res.status(201).json(newRequest); // ✅ Always returning JSON
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message }); // ✅ JSON even on error
    }
});

// Update request status (Approve/Reject)
router.put("/:id", async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const updatedRequest = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


module.exports = router;
