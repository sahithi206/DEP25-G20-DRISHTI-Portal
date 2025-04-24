const express = require('express');
const router = express.Router();
const multer = require('multer');
const { fetchUser } = require('../MiddleWares/fetchUser');
const { fetchAdmin } = require('../MiddleWares/fetchAdmin');
const Equipment = require('../Models/Quotations/Equipment');
const SalaryBreakUp = require('../Models/Quotations/salaryBreakUp');
const Quotation = require('../Models/Quotations/quotation');
const Project = require('../Models/Project');
const Scheme = require("../Models/Scheme");
const Comment = require('../Models/Quotations/comments.js');
const { fetchInstitute } = require("../MiddleWares/fetchInstitute.js");
const { ObjectId } = require("mongodb");
const quotation = require('../Models/Quotations/quotation');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/equipment/:id/upload', fetchUser, upload.single('quotation'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      {
        quotationFile: req.file.path,
        fileOriginalName: req.file.originalname,
        fileSize: req.file.size,
        fileMimetype: req.file.mimetype
      },
      { new: true }
    );

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({
      message: 'File uploaded successfully',
      filePath: req.file.path,
      equipment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/submit-quotation/:id', fetchUser, async (req, res) => {
  const { bank, equipments, salaryRows } = req.body;

  try {
    if (!equipments && !salaryRows) {
      return res.status(400).json({ success: false, msg: "Please provide either equipment details or salary rows." });
    }

    let equipmentsId = "";
    let salaryBreakUpId = "";
    if (equipments && equipments.length > 0) {
      if (!Array.isArray(equipments)) {
        return res.status(400).json({ success: false, msg: "Equipments should be an array." });
      }

      const equip = new Equipment({
        projectId: req.params.id,
        equipments,
      });
      await equip.save();
      equipmentsId = equip._id;
    }

    if (salaryRows && salaryRows.length > 0) {
      if (!Array.isArray(salaryRows)) {
        return res.status(400).json({ success: false, msg: "Salary rows should be an array." });
      }
      console.log(salaryRows);

      const mappedSalaryRows = salaryRows.map(row => {
        const yearKeys = Object.keys(row).filter(key => key.startsWith("Year"));
        const yearTotals = yearKeys.map(year => Number(row[year])).filter(val => !isNaN(val));
        console.log(yearTotals);
        const breakup = yearKeys.flatMap(year => row.breakup?.[year] || []);
        console.log(breakup);
        return {
          designation: row.designation,
          YearTotal: yearTotals,
          breakup: breakup.map(item => ({
            name: item.name || "Unknown",
            value: item.value || 0,
            months: item.months || 0,
          }))
        };
      });
      const salaryBreakup = new SalaryBreakUp({
        projectId: req.params.id,
        salary: mappedSalaryRows
      });
      await salaryBreakup.save();
      salaryBreakUpId = salaryBreakup._id;
    }

    const quotation = new Quotation({
      projectId: req.params.id,
      bank,
      equipmentsId,
      salaryBreakUpId,
    });
    await quotation.save();

    if (quotation) {
      await SalaryBreakUp.findByIdAndUpdate(salaryBreakUpId, {
        $set: { QuotationId: quotation._id }
      }, { new: true, runValidators: true });
      await Equipment.findByIdAndUpdate(equipmentsId, {
        $set: { QuotationId: quotation._id }
      }, { new: true, runValidators: true });
    }

    res.status(200).json({ success: true, quotation, msg: "Data submitted successfully" });

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ success: false, message: "An error occurred while submitting the quotation: " + e.message });
  }
});


//Admin side
router.get('/admin/get-quotations', fetchAdmin, async (req, res) => {
  try {
    if (req.admin.role !== "Coordinator") {
      return res.status(400).json({ success: false, msg: "Only corresponding Coordinator has access" });
    }
    const all_quotations = await Quotation.find({status:"Pending"});
    const quotations = (await Promise.all(
      all_quotations.map(async (quotation) => {
        const project = await Project.findById(quotation.projectId).select("Scheme Title");
        console.log("Project", project);
        const scheme = await Scheme.findById(project?.Scheme).select("coordinator name");
        console.log("scheme", scheme);
        console.log(req.admin);
        let id = new ObjectId(req.admin.id);
        console.log(id);
        console.log(scheme.coordinator);
        if (String(scheme.coordinator) !== req.admin.id) {
          return null;
        }
        return {
          ...quotation.toObject(),
          scheme: scheme?.name,
          projectId: project?._id,
          Title: project?.Title
        };
      })
    )).filter(quotation => quotation !== null);
    console.log(quotations);
    res.status(200).json({ success: true, quotations, msg: "Quotations fetched Successfully!!" });

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ success: false, message: "An error occurred while fteching the quotation: " + e.message });
  }
});

router.get('/admin/get-quotation/:id', fetchAdmin, async (req, res) => {
  try {
    if (req.admin.role !== "Coordinator") {
      return res.status(400).json({ success: false, msg: "Only corresponding Coordinator has access" });
    }
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Quotation ID" });
    }
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(400).json({ success: false, msg: "Quotation not Found!!" });
    }
    const equipments = await Equipment.findById(quotation?.equipmentsId);
    const salary = await SalaryBreakUp.findById(quotation?.salaryBreakUpId);
    return res.status(200).json({ success: true, quotation,equipments,salary, msg: "Quotation fetched Successfully!!" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ success: false, msg: "An error occurred while fetching the quotation: " + e.message });
  }
});
router.post('/admin/markasread/:id', fetchAdmin, async (req, res) => {
  try {
    if (req.admin.role !== "Coordinator") {
      return res.status(400).json({ success: false, msg: "Only corresponding Coordinator has access" });
    }
    const { id } = req.params;
    console.log(id);
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Quotation ID" });
    }
    let quotation = await Quotation.findById(id);
    console.log(quotation);
    if (!quotation) {
      return res.status(400).json({ success: false, msg: "Quotation not Found!!" });
    }
     quotation = await Quotation.findByIdAndUpdate(id, {status:"Viewed"},{new:true});
    return res.status(200).json({ success: true, quotation, msg: "Quotation marked as read successfully!" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ success: false, msg: "An error occurred while fetching the quotation: " + e.message });
  }
});

router.post('/admin/comment/:id', fetchAdmin, async (req, res) => {
  const {comment}=req.body;
  try {
    if (req.admin.role !== "Coordinator") {
      return res.status(400).json({ success: false, msg: "Only corresponding Coordinator has access" });
    }
    const { id } = req.params;
    console.log(id);
    if(!comment){
      return res.status(400).json({ success: false, msg: "Enter Comment" });
    }
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Quotation ID" });
    }
    let quotation = await Quotation.findById(id);
    console.log(quotation);
    if (!quotation) {
      return res.status(400).json({ success: false, msg: "Quotation not Found!!" });
    }
    const comments = new Comment({
      comment,
      quotationId:id,
    });
    await comments.save();
    return res.status(200).json({ success: true, comments, msg: "Quotation marked as read successfully!" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ success: false, msg: "An error occurred while fetching the quotation: " + e.message });
  }
});

router.get('/pi/get-quotation/:id', fetchUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Quotation ID" });
    }
    const quotation = await Quotation.findById(id);
    console.log(quotation);
    if (!quotation) {
      return res.status(400).json({ success: false, msg: "Quotation not Found!!" });
    }
    const equipments = await Equipment.findById(quotation?.equipmentsId);
    const salary = await SalaryBreakUp.findById(quotation?.salaryBreakUpId);
    return res.status(200).json({ success: true, quotation,equipments,salary, msg: "Quotation fetched Successfully!!" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ success: false, msg: "An error occurred while fetching the quotation: " + e.message });
  }
});

router.get('/pi/get-quotations/:id', fetchUser, async (req, res) => {
  try {
    
    const all_quotations = await Quotation.find({});
    const quotations = (await Promise.all(
      all_quotations.map(async (quotation) => {
        const project = await Project.findById(quotation.projectId).select("Scheme Title");
        console.log("Project", project);
        const scheme = await Scheme.findById(project?.Scheme).select("coordinator name");
        console.log("scheme", scheme);
        console.log(req.admin);
        return {
          ...quotation.toObject(),
          scheme: scheme?.name,
          projectId: project?._id,
          Title: project?.Title
        };
      })
    )).filter(quotation => quotation !== null);
    console.log(quotations);
    res.status(200).json({ success: true, quotations, msg: "Quotations fetched Successfully!!" });

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ success: false, message: "An error occurred while fteching the quotation: " + e.message });
  }
});
router.get('/comments/:id', fetchUser, async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.find({quotationId:id,status:"Pending"});
 
  res.json({ comment });
});

router.put('/pi/edit-quotation/:id', fetchUser, async (req, res) => {
  const { quotation: quotationData, equipments: equipmentsData, salary: salaryData } = req.body;

  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Quotation ID" });
    }

    const existingQuotation = await Quotation.findById(id);
    if (!existingQuotation) {
      return res.status(404).json({ success: false, msg: "Quotation not found" });
    }

    const updatedEquipments = await Equipment.findByIdAndUpdate(
      existingQuotation.equipmentsId,
      equipmentsData,
      { new: true }
    );

    const updatedSalary = await SalaryBreakUp.findByIdAndUpdate(
      existingQuotation.salaryBreakUpId,
      salaryData,
      { new: true }
    );

    const updatedQuotation = await Quotation.findByIdAndUpdate(
      id,
      {bank: quotationData.bank},
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Quotation updated successfully",
      quotation: updatedQuotation,
      equipments: updatedEquipments,
      salary: updatedSalary,
    });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ success: false, msg: "Server Error: " + e.message });
  }
});

router.put('/update-comment/:id', fetchUser, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    res.status(200).json({ success: true, comment, msg: "Comment updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error while updating comment" });
  }
});

router.get('/admin/resolved-comments/:quotationId', async (req, res) => {
  try {
      const comments = await Comment.find({ quotationId: req.params.quotationId,status:"Resolved" });
      res.json({ comments });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching comments' });
  }
});

router.put('/admin/view-comment/:commentId', async (req, res) => {
  try {
      const updated = await Comment.findByIdAndUpdate(
          req.params.commentId,
          { status: 'Viewed' },
          { new: true }
      );
      if (!updated) return res.status(404).json({ msg: "Comment not found" });

      res.json({ msg: "Comment marked as viewed", comment: updated });
  } catch (error) {
      res.status(500).json({ msg: "Server error" });
  }
});
router.get('/institute/get-quotation/:id', fetchInstitute, async (req, res) => {
 try{
  console.debug(`Fetching quotation with ID: ${req.params.id}`);
    console.log(req.params.id);
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Quotation ID" });
    }
    const quotation = await Quotation.findById(id);
    console.log(quotation);
    if (!quotation) {
      return res.status(400).json({ success: false, msg: "Quotation not Found!!" });
    }
    const equipments = await Equipment.findById(quotation?.equipmentsId);
    const salary = await SalaryBreakUp.findById(quotation?.salaryBreakUpId);
    return res.status(200).json({ success: true, quotation,equipments,salary, msg: "Quotation fetched Successfully!!" });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ success: false, msg: "An error occurred while fetching the quotation: " + e.message });
  }
});

router.get('/institute/get-quotations/:id', fetchInstitute, async (req, res) => {
  try {
    
    const all_quotations = await Quotation.find({});
    const quotations = (await Promise.all(
      all_quotations.map(async (quotation) => {
        const project = await Project.findById(quotation.projectId).select("Scheme Title");
        console.log("Project", project);
        const scheme = await Scheme.findById(project?.Scheme).select("coordinator name");
        console.log("scheme", scheme);
        console.log(req.admin);
        return {
          ...quotation.toObject(),
          scheme: scheme?.name,
          projectId: project?._id,
          Title: project?.Title
        };
      })
    )).filter(quotation => quotation !== null);
    console.log(quotations);
    res.status(200).json({ success: true, quotations, msg: "Quotations fetched Successfully!!" });

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ success: false, message: "An error occurred while fteching the quotation: " + e.message });
  }
});

module.exports = router;
