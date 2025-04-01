const express = require('express');
const router = express.Router();
const multer = require('multer');
const { fetchUser } = require('../MiddleWares/fetchUser');
const Equipment = require('../Models/Quotations/Equipment');
const SalaryBreakUp = require('../Models/Quotations/SalaryBreakUp');
const Quotation = require('../Models/Quotations/quotation');

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
            noOfPersons: item.noOfPersons || 0,
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

module.exports = router;
