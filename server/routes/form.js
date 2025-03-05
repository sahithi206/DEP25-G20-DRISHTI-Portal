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
const General_Info = require("../Models/General_Info");
const router = express.Router();
router.post("/ProposalID", fetchUser, async (req, res, next) => {
    const {_id} = req.user;
    const {Scheme}=req.body;
    console.log(_id);
    try {
        const me= await User.findById({_id:req.user._id}).populate("proposals");
        const proposals=me.proposals;
        console.log(proposals);
        const project=proposals&&proposals.filter(prop =>prop.Scheme===Scheme)
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
  const {name,address,mobileNo, email,instituteName,coordinator,areaOfSpecialization , DBTproj_ong, DBTproj_completed, Proj_ong , Proj_completed} = req.body;
  const {proposalId}=req.params
  const props = await General_Info.findOne({proposalId});
  if(props){
    await General_Info.findOneAndUpdate({proposalId:proposalId},{name,address,mobileNo, email,instituteName,coordinator,areaOfSpecialization , DBTproj_ong, DBTproj_completed, Proj_ong , Proj_completed},{new:true});
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
      coordinator, 
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
/*
router.post("/submit-budget/:proposalId", fetchUser, async (req, res) => {
  const { recurring_items, non_recurring_items, other_expenses = {} } = req.body;
  const {proposalId}=req.params;

  try {
   
      const user = await User.findById(req.user._id).populate("proposals");
      if (!user) {
          return res.status(404).json({ success: false, msg: "User not found" });
      }

      let totalRecurring = 0,
          totalNonRecurring = 0,
          totalOtherExpenses = 0;

      if (recurring_items?.employees?.length > 0) {
          const employees = recurring_items.employees.map(emp => {
              const total = emp.Emoluments * emp.noOfEmployees;
              totalRecurring += total;
              return {
                  designation: emp.designation,
                  noOfEmployees: emp.noOfEmployees,
                  Emoluments: emp.Emoluments,
                  total
              };
          });
          const props = await Recurring.findOne({proposalId});
          if(props){
            await Recurring.findOneAndUpdate({proposalId:proposalId},{noOfEquip: recurring_items.noOfEquip || 0,employee: employees},{new:true});
          }else{
            await new Recurring({
              proposalId,
              noOfEquip: recurring_items.noOfEquip || 0,
              employee: employees
          }).save();
          }
      }

      if (non_recurring_items?.items?.length > 0) {
          const items = non_recurring_items.items.map(item => {
              const total = item.UnitCost * item.quantity;
              totalNonRecurring += total;
              return {
                  UnitCost: item.UnitCost,
                  quantity: item.quantity,
                  total
              };
          });
          const props = await NonRecurring.findOne({proposalId});
          if(props){
            await NonRecurring.findOneAndUpdate({proposalId:proposalId},{noOfEquip: non_recurring_items.noOfEquip || 0,items},{new:true});
          }
          else{
            await new NonRecurring({
              proposalId,
              noOfEquip: non_recurring_items.noOfEquip || 0,
              items
            }).save();
          }
      }

      console.log(other_expenses.expense);
      if (Array.isArray(other_expenses.expense) && other_expenses.expense.length > 0) {
        
          const expenses = other_expenses.expense.map(expense => {
              totalOtherExpenses += expense.amount;
              return {
                  description: expense.description,
                  amount: expense.amount
              };
          });
          console.log(expenses);
          const props = await OtherExpenses.findOne({proposalId});
          if(props){
            await OtherExpenses.findOneAndUpdate({proposalId:proposalId},{ noOfEquip: other_expenses.noOfEquip || 0,expense: expenses},{new:true});
          }
          else{
              const savedOtherExpenses = await new OtherExpenses({
                  proposalId,
                  noOfEquip: other_expenses.noOfEquip || 0,
                  expense: expenses
              }).save();

              console.log("Saved Other Expenses:", savedOtherExpenses);

            }

      }
      
      const props= await Budget.findOne({proposalId:proposalId});
      if(props){
        await Budget.findOneAndUpdate({proposalId:proposalId},{ recurring_total: totalRecurring,non_recurring_total: totalNonRecurring,total: totalRecurring + totalNonRecurring + totalOtherExpenses},{new:true});
       return res.status(200).json({success:true,msg:"Updated Budget Details Successfully"});
      }
      else{
          const savedBudget = await new Budget({
              proposalId,
              recurring_total: totalRecurring,
              non_recurring_total: totalNonRecurring,
              total: totalRecurring + totalNonRecurring + totalOtherExpenses
          }).save();
          console.log("Saved Budget:", savedBudget);
        }


      res.status(200).json({ success: true, msg: "Budget details saved successfully" });

  } catch (error) {
      console.error("Error saving budget:", error);
      res.status(500).json({ success: false, msg: "Failed to save budget details" });
  }
});
*/
router.post("/submit-budget/:proposalId", fetchUser, async (req, res) => {
  const { recurring_items, non_recurring_items } = req.body;
  const {proposalId} = req.params;

  try {

      let totalRecurring = 0, totalNonRecurring = 0;
      let items=[], consumables = [], employees = [], others = [];
      if (recurring_items?.employees?.length > 0) {
           employees = recurring_items.employees.map(emp => {
              const total = emp.Emoluments * emp.noOfEmployees;
              totalRecurring += total;
              return {
                  designation: emp.designation,
                  noOfEmployees: emp.noOfEmployees,
                  Emoluments: emp.Emoluments,
                  total
              };
            });
         console.log(employees);
      }

      if (recurring_items?.consumables?.length > 0) {
          consumables = recurring_items.consumables.map(item => {
              const total = item.UnitCost * item.quantity;
              totalRecurring += total;
              return {
                  item: item.item,
                  quantity: item.quantity,
                  perUnitCost: item.UnitCost,
                  total
              };
          });
          console.log(consumables);
      }

      if (recurring_items?.others?.length > 0) {
           others = recurring_items.others.map(expense => {
              totalRecurring += expense.amount;
              return {
                  description: expense.description,
                  amount: expense.amount
              };
          });
          console.log(others);
      }
      if (non_recurring_items?.items?.length > 0) {
           items = non_recurring_items.items.map(item => {
              const total = item.UnitCost * item.quantity;
              totalNonRecurring += total;
              return {
                  item: item.item,
                  UnitCost: item.UnitCost,
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

      /*if (!name || !department || !institute || !address || !pincode || !mobile || !email || noOfDBTProjects === undefined || noOfProjects === undefined || !proposalId) {
          return res.status(400).json({ success: false, msg: "All fields are required" });
      }*/

      const props= await PI.findOne({proposalId:proposalId});
      if(props){
        await PI.findOneAndUpdate({proposalId:proposalId},{members},{new:true});
       return res.status(200).json({success:true,msg:"Updated Bank Account Details Successfully"});
      }

      const piDetails = new PI({proposalId,members});
      await piDetails.save();

      res.status(200).json({ success: true,piDetails, msg: "PI details stored successfully" });

  } catch (error) {
      console.error("Error storing PI details:", error);
      res.status(500).json({ success: false, msg: "Failed to store PI details" });
  }
});

router.get("/get-proposal/:proposalId", fetchUser, async (req, res) => {
  const { proposalId } = req.params;

  try {
    const generalInfo = await GeneralInfo.findOne({ proposalId: proposalId });
    const researchDetails = await ResearchDetails.findOne({ proposalId: proposalId });
    const budgetSummary = await Budget.findOne({ proposalId: proposalId });
    const bankDetails=await Bank.findOne({ proposalId: proposalId });
    const PIdetails=await PI.findOne({ proposalId: proposalId });
    if (!generalInfo || !researchDetails || !budgetSummary||!bankDetails||!PIdetails) {
      return res.status(404).json({ success: false, msg: "Proposal not found" });
    }

    res.status(200).json({
      success: true,
      data: { generalInfo,PIdetails, researchDetails, budgetSummary,bankDetails},
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
    console.log("User ID from Token:", userId);
     
    const objectId = new mongoose.Types.ObjectId(userId);
    console.log("Converted ObjectId:", objectId);

    const proposals = await Proposal.find({ userId: objectId, status: "Pending" });

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

module.exports = router;
/*const express = require("express");
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
  const {  instituteName,coordinator,areaOfSpecialization} = req.body;
  const {proposalId}=req.params
  try {
    const generalInfo = new GeneralInfo({
      instituteName,coordinator,areaOfSpecialization,proposalId
    });
    console.log(generalInfo);
    await generalInfo.save();
    res.status(200).json({ success: true, msg: "General info saved", generalInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error,msg: "Failed to save general info" });
  }
});

router.post("/submit-research-details/:proposalId", fetchUser, async (req, res) => {
  const { Title,Duration,Summary,objectives,Output,other} = req.body;
    const {proposalId}=req.params

  try {
    const researchDetails = new ResearchDetails({
        Title,Duration,Summary,objectives,Output,other,proposalId
    });
    //const details= await ResearchDetails.findOne({proposalId:proposal[0].ProposalId});
    //console.log(details);
    await researchDetails.save();
    res.status(200).json({ success: true, msg: "Research details saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Failed to save research details" });
  }
});

router.post("/submit-budget/:proposalId", fetchUser, async (req, res) => {
  const { recurring_items, non_recurring_items, other_expenses = {} } = req.body;
  const {proposalId}=req.params;

  try {
      const user = await User.findById(req.user._id).populate("proposals");
      if (!user) {
          return res.status(404).json({ success: false, msg: "User not found" });
      }

      let totalRecurring = 0,
          totalNonRecurring = 0,
          totalOtherExpenses = 0;

      if (recurring_items?.employees?.length > 0) {
          const employees = recurring_items.employees.map(emp => {
              const total = emp.Emoluments * emp.noOfEmployees;
              totalRecurring += total;
              return {
                  designation: emp.designation,
                  noOfEmployees: emp.noOfEmployees,
                  Emoluments: emp.Emoluments,
                  total
              };
          });

          await new Recurring({
              proposalId,
              noOfEquip: recurring_items.noOfEquip || 0,
              employee: employees
          }).save();
      }

      if (non_recurring_items?.items?.length > 0) {
          const items = non_recurring_items.items.map(item => {
              const total = item.UnitCost * item.quantity;
              totalNonRecurring += total;
              return {
                  UnitCost: item.UnitCost,
                  quantity: item.quantity,
                  total
              };
          });

          await new NonRecurring({
              proposalId,
              noOfEquip: non_recurring_items.noOfEquip || 0,
              items
          }).save();
      }

      console.log(other_expenses.expense);
      if (Array.isArray(other_expenses.expense) && other_expenses.expense.length > 0) {
        
          const expenses = other_expenses.expense.map(expense => {
              totalOtherExpenses += expense.amount;
              return {
                  description: expense.description,
                  amount: expense.amount
              };
          });
          console.log(expenses);
          const savedOtherExpenses = await new OtherExpenses({
              proposalId,
              noOfEquip: other_expenses.noOfEquip || 0,
              expense: expenses
          }).save();

          console.log("Saved Other Expenses:", savedOtherExpenses);
      }

      const savedBudget = await new Budget({
          proposalId,
          recurring_total: totalRecurring,
          non_recurring_total: totalNonRecurring,
          total: totalRecurring + totalNonRecurring + totalOtherExpenses
      }).save();

      console.log("Saved Budget:", savedBudget);

      res.status(200).json({ success: true, msg: "Budget details saved successfully" });

  } catch (error) {
      console.error("Error saving budget:", error);
      res.status(500).json({ success: false, msg: "Failed to save budget details" });
  }
});


router.post("/submit-acknowledgement/:proposalId", fetchUser, async (req, res) => {
  const { accept,scheme } = req.body;
  const {proposalId}=req.params;
  try {
    //const user = await User.findById(req.user._id).populate("proposals");
    //if (!user) return res.status(404).json({ success: false, msg: "User not found" });
   // const proposal = user.proposals.find(prop => prop.Scheme === scheme);
   // if (!proposal) return res.status(404).json({ success: false, msg: "Proposal not found for this scheme" });
    const acknowledgement = new Acknowledgement({
      proposalId,
      TCaccepted:accept,
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
      const {name, accountNumber, ifscCode, accountType, bankName,scheme } = req.body;
      const {proposalId}=req.params;
      const user = await User.findById(req.user._id).populate("proposals");
      if (!user) {
          return res.status(404).json({ success: false, msg: "User not found" });
      }
     /* const proposal = user.proposals.find(prop => prop.Scheme === scheme);
      if (!proposal) {
          return res.status(404).json({ success: false, msg: "Proposal not found for this scheme" });
      }
      const proposalId = proposal.ProposalId;


      if (!proposalId || !name || !accountNumber || !ifscCode || !accountType || !bankName) {
          return res.status(400).json({ success: false, msg: "All fields are required" });
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
      const { name, department, institute, address, pincode, mobile, email, noOfDBTProjects, noOfProjects} = req.body;
      const {proposalId}=req.params;
      const user = await User.findById(req.user._id).populate("proposals");
      if (!user) {
          return res.status(404).json({ success: false, msg: "User not found" });
      }
     // const proposal = user.proposals.find(prop => prop.Scheme === scheme);
      //if (!proposal) {
        //  return res.status(404).json({ success: false, msg: "Proposal not found for this scheme" });
      //}
      if (!name || !department || !institute || !address || !pincode || !mobile || !email || noOfDBTProjects === undefined || noOfProjects === undefined || !proposalId) {
          return res.status(400).json({ success: false, msg: "All fields are required" });
      }

      const piDetails = new PI({
          name,
          department,
          institute,
          address,
          pincode,
          mobile,
          email,
          noOfDBTProjects,
          noOfProjects,
          proposalId
      });

      await piDetails.save();

      res.status(200).json({ success: true,piDetails, msg: "PI details stored successfully" });

  } catch (error) {
      console.error("Error storing PI details:", error);
      res.status(500).json({ success: false, msg: "Failed to store PI details" });
  }
});

router.get("/get-proposal/:proposalId", fetchUser, async (req, res) => {
  const { proposalId } = req.params;

  try {
    const generalInfo = await GeneralInfo.findOne({ proposalId: proposalId });
    const researchDetails = await ResearchDetails.findOne({ proposalId: proposalId });
    const budgetSummary = await Budget.findOne({ proposalId: proposalId });
    const bankDetails=await Bank.findOne({ proposalId: proposalId });
    const PIdetails=await PI.findOne({ proposalId: proposalId });
    if (!generalInfo || !researchDetails || !budgetSummary||!bankDetails||!PIdetails) {
      return res.status(404).json({ success: false, msg: "Proposal not found" });
    }

    res.status(200).json({
      success: true,
      data: { generalInfo, researchDetails, budgetSummary,bankDetails,PIdetails},
      msg: "Proposal fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Failed to fetch proposal details" });
  }
});

module.exports = router;
*/