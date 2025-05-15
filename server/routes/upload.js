// This file defines routes for handling file uploads related to equipment quotations.
// It includes functionality for uploading, validating, and storing files on the server.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Equipment = require('../Models/Quotations/Equipment');

const equipmentStorage = multer.diskStorage({
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

const uploadEquipmentFile = multer({ 
  storage: equipmentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter
});

router.post('/equipment/:id/upload', uploadEquipmentFile.single('quotation'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file was uploaded' 
      });
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
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        equipmentId: equipment._id,
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading equipment file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
});

module.exports = router;