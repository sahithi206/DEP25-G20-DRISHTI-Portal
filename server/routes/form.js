const express = require("express");
const { fetchUser } = require("../Middlewares/fetchUser");
const GeneralInfo = require("../Models/General_Info");
const ResearchDetails = require("../Models/researchDetails");
const Budget = require("../Models/Budget");
const Recurring = require("../Models/Recurring");
const Bank=require("../Models/bank details");
const NonRecurring = require("../Models/NonRecurring");
const OtherExpenses = require("../Models/OtherExpenses");
const Acknowledgement = require("../Models/acknowledgement");
const Proposal = require("../Models/Proposal");
const Auth=require("./auth.js");
const User=require("../Models/user");
const PI=require("../Models/PI");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
      const id = req.params.id || "unknown";
      cb(null, `${id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
      const fileType = req.params.type; 
      const isImage = file.mimetype.startsWith("image/");
      const isPDF = file.mimetype === "application/pdf";

      if ((fileType === "photo" && isImage) || (fileType === "pdf" && isPDF)) {
          cb(null, true);
      } else {
          cb(new Error("Invalid file type! Only images and PDFs are allowed."));
      }
  }
});


router.post("/ProposalID", fetchUser, async (req, res, next) => {
    const {_id} = req.user;
    const {Scheme}=req.body;
    console.log(_id);
    try {
        const me= await User.findById({_id:req.user._id}).populate("proposals");
        const proposals=me.proposals;
        console.log(proposals);
        const project=proposals&&proposals.filter(prop =>prop.Scheme===Scheme)
        console.log(project);
        if(project.length>0){
           return res.status(404).json({success:false,msg:"A Proposal was Already Submitted for this Scheme"});
        }

        const prop = new Proposal({
            userId: _id,
            Scheme,
            status: "Pending"
        });
        await prop.save();
        
        const user= await User.findByIdAndUpdate(_id,{ 
            $push: { proposals: { ProposalId: prop._id, Scheme:Scheme} } 
        },
        {new:true} 
         );
         res.status(200).json({ success: true, msg: "Proposal ID Generated", prop });


    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error, msg: "Failed to generate Proposal ID" });
    }
});
router.post("/submitGI/:proposalId", fetchUser, async (req, res) => {
  const {name, address, mobileNo, email, instituteName, areaOfSpecialization, DBTproj_ong, DBTproj_completed, Proj_ong, Proj_completed} = req.body;  const {proposalId}=req.params
  const props = await General_Info.findOne({proposalId});
  if(props){
    await General_Info.findOneAndUpdate({proposalId:proposalId},{name,address,mobileNo, email,instituteName,areaOfSpecialization , DBTproj_ong, DBTproj_completed, Proj_ong , Proj_completed},{new:true});
    return res.status(200).json({success:true,msg:"General Info Updated!!"});
  }
  try {
    const generalInfo = new GeneralInfo({
      proposalId,
      name, 
      address, 
      mobileNo, 
      email, 
      instituteName, 
      areaOfSpecialization, 
      DBTproj_ong, 
      DBTproj_completed, 
      Proj_ong, 
      Proj_completed
    });
    console.log(generalInfo);
    await generalInfo.save();
    res.status(200).json({ success: true, msg: "General info saved", generalInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error,msg: "Failed to save general info" });
  }
});
router.post("/upload/:type/:id", upload.single("file"), (req, res) => {
  console.log("Received file:", req.file); 
  
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileSize = req.file.size;
  const fileType = req.params.type;
  const isPDF = req.file.mimetype === "application/pdf";
  const isImage = req.file.mimetype.startsWith("image/");

  if (fileType === "pdf" && (!isPDF || fileSize > 10 * 1024 * 1024)) {
    return res.status(400).json({ error: "PDF size exceeds 10MB or invalid file type" });
  } else if (fileType === "photo" && (!isImage || fileSize > 500 * 1024)) {
    return res.status(400).json({ error: "Image size exceeds 500KB or invalid file type" });
  }

  res.json({
    message: "File uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
  });
});



router.post("/submit-research-details/:proposalId", fetchUser, async (req, res) => {
  const { Title,Duration,Summary,objectives,Output,other} = req.body;
    const {proposalId}=req.params

  try {
    const props = await ResearchDetails.findOne({proposalId});
    if(props){
      await ResearchDetails.findOneAndUpdate({proposalId:proposalId},{Title,Duration,Summary,objectives,Output,other},{new:true});
      return res.status(200).json({success:true,msg:"Research Details Updated!!"});
    }
    const researchDetails = new ResearchDetails({
        Title,Duration,Summary,objectives,Output,other,proposalId
    });
    /*const details= await ResearchDetails.findOne({proposalId:proposal[0].ProposalId});
    console.log(details);*/
    await researchDetails.save();
    res.status(200).json({ success: true, msg: "Research details saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Failed to save research details" });
  }
});
router.post("/submit-budget/:proposalId", fetchUser, async (req, res) => {
  const { recurring_items, non_recurring_items } = req.body;
  console.log("hi : " , recurring_items, non_recurring_items);
  const { proposalId } = req.params;

  try {
    let totalRecurring = 0, totalNonRecurring = 0;
    let items = [], consumables = [], employees = [], others = [];

    if (recurring_items?.employees?.length > 0) {
      employees = recurring_items.employees.map(emp => {
        const noOfEmployees = parseFloat(emp.numEmployees) || 0;
        console.log(noOfEmployees);
        const Emoluments = parseFloat(emp.salary) || 0;
        const total = Emoluments * noOfEmployees;
        console.log(total);
        totalRecurring += total;
        return {
          designation: emp.role,
          noOfEmployees,
          Emoluments,
          total
        };
      });
      console.log(employees);
    }

    if (recurring_items?.consumables?.length > 0) {
      consumables = recurring_items.consumables.map(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const UnitCost = parseFloat(item.perUnitCost) || 0;
        const total = UnitCost * quantity;
        totalRecurring += total;
        console.log("material", item.material);
        return {
          item: item.material,
          quantity,
          perUnitCost: UnitCost,
          total
        };
      });
      console.log(consumables);
    }

      if (recurring_items?.others?.length > 0) {
           others = recurring_items.others.map(expense => {
              totalRecurring += expense.amount;
              return {
                  description: expense.expense,
                  amount: expense.amount
              };
          });
          console.log(others);
      }
      if (non_recurring_items?.items?.length > 0) {
           items = non_recurring_items.items.map(item => {
              const total = item.unitCost * item.quantity;
              totalNonRecurring += total;
              return {
                  item: item.item,
                  UnitCost: item.unitCost,
                  quantity: item.quantity,
                  total
              };
          });
          console.log(items);
        }
          const recurringUpdate = await Recurring.findOneAndUpdate(
            { proposalId },
            { human_resources : employees,
              consumables:consumables,
              others:others },
            { new: true, upsert: true }
          );
          
          const nonRecurringUpdate = await NonRecurring.findOneAndUpdate(
            { proposalId },
            { items },
            { new: true, upsert: true }
          );
          
          const budgetUpdate = await Budget.findOneAndUpdate(
            { proposalId },
            { 
              recurring_total: totalRecurring, 
              non_recurring_total: totalNonRecurring, 
              total: totalRecurring + totalNonRecurring 
            },
            { new: true, upsert: true }
          );
          
          console.log(recurringUpdate);
          
          const message = (recurringUpdate && nonRecurringUpdate && budgetUpdate) 
            ? "Updated Budget Details Successfully" 
            : "Budget details saved successfully";
          
          res.status(200).json({ success: true, msg: message });
          

  } catch (error) {
      console.error("Error saving budget:", error);
      res.status(500).json({ success: false, msg: "Failed to save budget details" });
  }
});


router.post("/submit-acknowledgement/:proposalId", fetchUser, async (req, res) => {
  const { accept } = req.body;
  const { proposalId } = req.params;
  console.log(proposalId);
  try {
    const generalInfo = await GeneralInfo.findOne({ proposalId }).select("_id");
    const researchDetails = await ResearchDetails.findOne({ proposalId }).select("_id");
    const budgetSummary = await Budget.findOne({ proposalId }).select("_id");
    const bankDetails = await Bank.findOne({ proposalId }).select("_id");
    const PIdetails = await PI.findOne({ proposalId }).select("_id");

    if (!generalInfo) {
      return res.status(404).json({ success: false, msg: "Fill all fields in General Information" });
    }
    if (!researchDetails) {
      return res.status(404).json({ success: false, msg: "Fill all fields in Research Details" });
    }
    if (!budgetSummary) {
      return res.status(404).json({ success: false, msg: "Fill all fields in Budget Details" });
    }
    if (!bankDetails) {
      return res.status(404).json({ success: false, msg: "Fill all fields in Bank Information" });
    }
    if (!PIdetails) {
      return res.status(404).json({ success: false, msg: "Fill all fields in Principal Investigator Information" });
    }

    const acknowledgement = new Acknowledgement({
      proposalId,
      TCaccepted: accept,
      generalInfoId: generalInfo._id,
      researchDetailsId: researchDetails._id,
      budgetSummaryId: budgetSummary._id,
      bankDetailsId: bankDetails._id,
      PIdetailsId: PIdetails._id,
      acknowledged_at: new Date(),
    });

    await acknowledgement.save();
    res.status(200).json({ success: true, msg: "Acknowledgement saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Failed to save acknowledgement" });
  }
});
router.post("/submit-bank-details/:proposalId", fetchUser, async (req, res) => {
    
  try {
      const {name, accountNumber, ifscCode, accountType, bankName} = req.body;
      const {proposalId}=req.params;
      if (!proposalId || !name || !accountNumber || !ifscCode || !accountType || !bankName) {
        return res.status(400).json({ success: false, msg: "All fields are required" });
      }
      const props= await Bank.findOne({proposalId:proposalId});
      if(props){
        await Bank.findOneAndUpdate({proposalId:proposalId},{ name,accountNumber,ifscCode,accountType,bankName},{new:true});
       return res.status(200).json({success:true,msg:"Updated Bank Account Details Successfully"});
      }
      const bankDetails = new Bank({
          proposalId,
          name,
          accountNumber,
          ifscCode,
          accountType,
          bankName
      });

      await bankDetails.save();

      res.status(200).json({ success: true, msg: "Bank details stored successfully" });

  } catch (error) {
      console.error("Error storing bank details:", error);
      res.status(500).json({ success: false, msg: "Failed to store bank details" });
  }
});

router.post("/submit-pi-details/:proposalId", fetchUser, async (req, res) => {
  try {
      const {members} = req.body;
      const {proposalId}=req.params;
      const user = await User.findById(req.user._id).populate("proposals");
      if (!user) {
          return res.status(404).json({ success: false, msg: "User not found" });
      }
      const props= await PI.findOne({proposalId:proposalId});
      console.log(members);
      if(props){
        await PI.findOneAndUpdate({proposalId:proposalId},{members},{new:true});
       return res.status(200).json({success:true,msg:"Updated PI Details Successfully"});
      }
      
      const piDetails = new PI({proposalId,members});
      await piDetails.save();

      res.status(200).json({ success: true,piDetails, msg: "PI details stored successfully" });

  } catch (error) {
      console.error("Error storing PI details:", error);
      res.status(500).json({ success: false, msg: "Failed to store PI details" });
  }
});

router.get("/get-proposal/:objectId", fetchUser, async (req, res) => {
  const {objectId} = req.params;
  try {
    console.log("Converted ObjectId:", objectId);
    const generalInfo = await GeneralInfo.findOne({ proposalId: objectId });
    const researchDetails = await ResearchDetails.findOne({ proposalId: objectId });
    const budgetSummary = await Budget.findOne({ proposalId: objectId });
    const bankDetails = await Bank.findOne({ proposalId: objectId });
    const PIdetails = await PI.findOne({ proposalId: objectId });
    const acknowledgements = await Acknowledgement.findOne({ proposalId: objectId });

    if (!generalInfo || !researchDetails || !budgetSummary || !bankDetails || !PIdetails || !acknowledgements) {
      return res.status(404).json({ success: false, msg: "Proposal not found" });
    }

    res.status(200).json({
      success: true,
      data: { generalInfo, PIdetails, researchDetails, budgetSummary, bankDetails, acknowledgements },
      msg: "Proposal fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Failed to fetch proposal details" });
  }
});
router.get("/proposals", fetchUser, async (req, res) => {
  try {
    const userId = req.user._id; 

    const proposals = await Proposal.find({ userId:userId, status: "Pending" });

    console.log("Fetched Proposals:", proposals);

    if (!proposals.length) {
      return res.status(404).json({ success: false, msg: "No proposals found" });
    }

    const data = await Promise.all(proposals.map(async (proposal) => {
      console.log("Processing Proposal ID:", proposal._id);

      const generalInfo = await GeneralInfo.findOne({ proposalId: proposal._id })
        .select({ 'instituteName': 1, 'areaOfSpecialization': 1 });

      console.log("General Info:", generalInfo);

      const researchDetails = await ResearchDetails.findOne({ proposalId: proposal._id })
        .select("Title");

      console.log("Research Details:", researchDetails);

      return { generalInfo, researchDetails };
    }));

    console.log("Final Data:", data);
    res.json({ success: true, data });

  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/acceptedproposals", fetchUser, async (req, res) => {
  try {
    const userId = req.user._id; 
    console.log("User ID from Token:", userId);
    const proposals = await Proposal.find({ userId:userId, status: "Accepted" });
    console.log("Fetched Proposals:", proposals);
    if (!proposals.length) {
      return res.status(404).json({ success: false, msg: "No proposals found" });
    }

    const data = await Promise.all(proposals.map(async (proposal) => {
      console.log("Processing Proposal ID:", proposal._id);
      const proposalId=proposal._id;
    /*  const generalInfo = await GeneralInfo.findOne({ proposalId: proposal._id })
        .select({ 'instituteName': 1, 'areaOfSpecialization': 1 });

      console.log("General Info:", generalInfo);*/

      const researchDetails = await ResearchDetails.findOne({ proposalId: proposal._id })
        .select("Title");
      console.log("Research Details:", researchDetails);

      return { proposalId, researchDetails };
    }));

    console.log("Final Data:", data);
    res.json({ success: true,msg:"Projects Fetched", data });

  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ success: false, msg:"Failed to Fetch Projects" , error: "Internal Server Error" });
  }
});

module.exports = router;