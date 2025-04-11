const express = require("express");
const Request = require("../Models/Request");
const { fetchUser } = require("../Middlewares/fetchUser");
const router = express.Router();
const { fetchAdmin } = require("../Middlewares/fetchAdmin");

// Fetch all requests
router.get("/", async (req, res) => {
    try {
        const requests = await Request.find({ status: "Pending" }).populate("userId");
        console.log(requests);
        res.status(200).json({success:"true",requests});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/submit-request", fetchUser, async (req, res) => {
    const { requestType, description } = req.body;
    const userId = req.user._id;

    try {
        const newRequest = new Request({
            requestType,
            description,
            userId,
        });

        await newRequest.save();
        res.status(200).json({ success: true, msg: "Request submitted successfully", newRequest });
    } catch (error) {
        console.error("Error submitting request:", error);
        res.status(500).json({ success: false, msg: "Failed to submit request", error });
    }
});


router.get("/user-requests", fetchUser, async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await Request.find({ userId });
        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ success: false, msg: "Failed to fetch requests", error });
    }
});

// Update request status (Approve/Reject)
router.put("/:id", fetchAdmin, async (req, res) => {
    try {
        const { status, comments } = req.body;
        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const updatedRequest = await Request.findByIdAndUpdate(req.params.id, { status , comments}, { new: true });
        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.json(updatedRequest);
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


module.exports = router;
