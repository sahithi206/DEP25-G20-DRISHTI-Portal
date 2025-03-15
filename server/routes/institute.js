// const express = require("express");
// const router = express.Router();
// const Proposal = require("../Models/Proposal");
// const { fetchUser } = require("../Middlewares/fetchUser");

// router.get("/institute-projects",
//     //  fetchUser,
//       async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user
//         //  || user.role !== "institute"
//         ) {
//       return res.status(403).json({ success: false, msg: "Access denied" });
//     }

//     const projects = await Proposal.find({ institute: user.institute, status: "Accepted" });
//     res.status(200).json({ success: true, projects });
//   } catch (error) {
//     console.error("Error fetching projects:", error);
//     res.status(500).json({ success: false, msg: "Failed to fetch projects" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const Proposal = require("../Models/Proposal");
const User = require("../Models/user");
const ResearchDetails = require("../Models/researchDetails"); 
const Institute = require("../Models/instituteID");
const { fetchInstitute } = require("../MiddleWares/fetchInstitute");

router.get("/institute-projects", fetchInstitute, async (req, res) => {
  try {
    const institute = req.institute.college;

    const users = await User.find({ Institute: institute });
    const userIds = users.map(user => user._id);

    const projects = await Proposal.find({ userId: { $in: userIds }, status: "Accepted" }).populate('userId', 'Name');

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res.status(500).json({ success: false, msg: "Failed to fetch projects", error: error.message });
  }
});

router.get("/users", fetchInstitute, async (req, res) => {
  try {
    const institute = req.institute.college;

    const users = await User.find({ Institute: institute });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ success: false, msg: "Failed to fetch users", error: error.message });
  }
});

  router.get("/:userId/accepted-proposals", fetchInstitute, async (req, res) => {
    try {
      const { userId } = req.params;
      const proposals = await Proposal.find({ userId: userId, status: "Accepted" });
      if (!proposals.length) {
        return res.status(404).json({ success: false, msg: "No accepted proposals found" });
      }
      res.status(200).json({ success: true, proposals });
    } catch (error) {
      console.error("Error fetching accepted proposals:", error.message);
      res.status(500).json({ success: false, msg: "Failed to fetch accepted proposals", error: error.message });
    }
  });

  // router.get("/:userId/accepted-proposals", async (req, res) => {
  //   try {
  //     const { userId } = req.params;
  //     const user = await User.findById(userId);
  //     if (!user) {
  //       return res.status(404).json({ success: false, msg: "User not found" });
  //     }
  
  //     const acceptedProposals = user.proposals.filter(proposal => proposal.status === "Accepted");
  //     if (!acceptedProposals.length) {
  //       return res.status(404).json({ success: false, msg: "No accepted proposals found" });
  //     }
  
  //     res.status(200).json({ success: true, proposals: acceptedProposals });
  //   } catch (error) {
  //     console.error("Error fetching accepted proposals:", error.message);
  //     res.status(500).json({ success: false, msg: "Failed to fetch accepted proposals", error: error.message });
  //   }
  // });

module.exports = router;