const express = require("express");
const Request = require("../Models/Request");
const { fetchUser } = require("../MddleWares/fetchUser");
const Project = require("../Models/Project");
const router = express.Router();
const { fetchInstitute } = require("../MddleWares/fetchInstitute");
const { fetchAdmin } = require("../MddleWares/fetchAdmin");
const ChangeInstitute =  require("../Models/Requests/ChangeInstitute");
const {ObjectId}= require("mongodb");
router.get("/", async (req, res) => {
    try {
        const requests = await Request.find({ status: "Pending" }).populate("userId");
        console.log(requests);
        res.status(200).json({success:"true",requests});
    } catch (error) {
        console.log(error.msg);
        res.status(500).json({ msg: "Server error", error });
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
         console.log(req.params.id);
        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            return res.status(400).json({success:false, msg: "Invalid status" });
        }
        const updatedRequest = await Request.findByIdAndUpdate(req.params.id, { status , comments}, { new: true });
        if (!updatedRequest) {
            return res.status(404).json({success:false, msg: "Request not found" });
        }
        if (!updatedRequest) {
            return res.status(404).json({success:false, msg: "Request not found" });
        }

        res.status(200).json({success:true,updatedRequest});
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({success:false, msg: "Server error", error });
    }
});

router.get("/pi/getongoingprojects", fetchUser, async (req, res) => {
    try {
         const projects = (await Project.find({ userId: req.user._id }).lean()).filter(
            project => new Date(project.endDate) > new Date()
         );
         console.log(projects);
         return res.status(200).json({success:true,msg:"Projects fetched",projects});

    }
    catch(e){
        console.log(e);
       return res.status(500).json({success:false,msg:"internal Server Error"});
    }
});

router.post("/submit-cirequest", fetchUser, async (req, res) => {
    try {
        const requestPayload=req.body;
        console.log(requestPayload);
        if(!requestPayload){
            return res.status(400).json({success:false,msg:"Cannot find Details"});
        }

        const request= new ChangeInstitute({
            projects:requestPayload.projects,
            FormData:requestPayload.description,
            userId:req.user._id,
            status:"Pending",

        })
        await request.save();
       return res.status(200).json({success:true,msg:"Request Submitted Successfully",request});
    }catch(e){
        console.log(e);
        return res.status(500).json({success:false,msg:"internal Server Error"});
    }
});

router.get("/get-ci",fetchAdmin, async (req, res) => {
    try {
        const requests = await ChangeInstitute.find({ status: "Pending for Admin's Approval" })
        .populate("projects")
        .lean();
    
        console.log(requests);
        res.status(200).json({success:"true",requests});
    } catch (error) {
        console.log(error.msg);
        res.status(500).json({ msg: "Server error", error });
    }
});
router.get("/get-instituteci",fetchInstitute, async (req, res) => {
    try {
        const requests = await ChangeInstitute.find()
        .populate("projects userId")
        .lean();
    
        console.log(requests);
        res.status(200).json({success:"true",requests});
    } catch (error) {
        console.log(error.msg);
        res.status(500).json({ msg: "Server error", error });
    }
});
router.get("/pi/getcirequests",fetchUser, async (req, res) => {
    try {
        const requests = await ChangeInstitute.find({userId:req.user._id})
        .populate("projects userId")
        .lean();
        console.log("user:",requests);
        res.status(200).json({success:"true",requests});
    } catch (error) {
        console.log(error.msg);
        res.status(500).json({ msg: "Server error", error });
    }
});
router.put('/:id/update-status',fetchInstitute, async (req, res) => {
    const { id } = req.params;
    const { status, comment } = req.body;
    console.log("req",status,comment);
    try {
      let request = await ChangeInstitute.findById(id);
     
      if (!request) {
        return res.status(404).json({ success: false, message: "Request not found" });
      }
    
       request = await ChangeInstitute.findByIdAndUpdate(id,{status,comment},{new:true});
        return   res.json({ success: true, message: `Request ${status} successfully.` });
    } catch (error) {
      console.error(error.message);
     return   res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  router.put('/pi/:id/update-status',fetchUser, async (req, res) => {
    let { id } = req.params;
    console.log(id);
    id=new ObjectId(id);
    const { status } = req.body;
    console.log("req",status);
    try {
      let request = await ChangeInstitute.findById(id);
      if (!request) {
        return res.status(404).json({ success: false, message: "Request not found" });
      }
       request = await ChangeInstitute.findByIdAndUpdate(id,{status},{new:true});
        return   res.json({ success: true, message: `Request ${status} successfully.` });
    } catch (error) {
      console.error(error.message);
     return   res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  
module.exports = router;
