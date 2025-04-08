const express = require("express");
const Scheme = require("../Models/Scheme");
const { fetchAdmin } = require("../MiddleWares/fetchAdmin");
const router = express.Router();
const { ObjectId } = require("mongodb");

// Get all schemes
router.get("/get-schemes", async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-allschemes",fetchAdmin, async (req, res) => {
  try {
    let id =new ObjectId(req.admin.id);
    const schemes = await Scheme.find({coordinator:id});
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new scheme
router.post("/new-scheme", async (req, res) => {
  try {
    const newScheme = new Scheme(req.body);
    console.log(newScheme);
    await newScheme.save();
    res.status(201).json(newScheme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

