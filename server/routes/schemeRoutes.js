const express = require("express");
const Scheme = require("../Models/Scheme");
const { fetchAdmin } = require("../MddleWares/fetchAdmin");
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

router.get("/:id", async (req, res) => {
  try {
      const scheme = await Scheme.findById(req.params.id);
      if (!scheme) {
          return res.status(404).json({ success: false, msg: "Scheme not found" });
      }
      res.status(200).json({ success: true, name: scheme.name });
  } catch (error) {
      console.error("Error fetching scheme:", error);
      res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
});

module.exports = router;

