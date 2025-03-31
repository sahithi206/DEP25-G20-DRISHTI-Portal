const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Equipment = require('../Models/Quotations/Equipment');
const { fetchUser } = require("../Middlewares/fetchUser");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/equipment/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'equipment-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only documents and images are allowed (JPEG, JPG, PNG, PDF, DOC, DOCX)'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Add equipment to project
router.post('/projects/:projectId/equipment', fetchUser, async (req, res) => {
  try {
    const equipment = new Equipment({
      projectId: req.params.projectId,
      ...req.body
    });
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all equipment for project
router.get('/projects/:projectId/equipment', fetchUser, async (req, res) => {
  try {
    const equipment = await Equipment.find({ projectId: req.params.projectId });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete equipment
router.delete('/equipment/:id', fetchUser, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload equipment file
router.post(
  '/equipment/:id/upload',
  fetchUser,
  upload.single('quotation'),
  async (req, res) => {
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
  }
);

module.exports = router;