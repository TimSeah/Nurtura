// server/routes/externalResources.js
// This file defines the routes for managing external resources in the Nurtura application.


const express = require("express");
const router = express.Router();
const ExternalResource = require("../models/ExternalResource");

// GET whatever external resources with api
router.get("/", async (req, res) => {
  try {
    const resources = await ExternalResource.find().sort({ dateAdded: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
