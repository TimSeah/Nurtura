// server/models/ExternalResources.js
// This file defines the schema for external resources in the Nurtura application.  


const mongoose = require("mongoose");

const externalResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true },
  image: String,            // this one is the thumbnail/icon url
  category: String,         // e.g. "article", "app", "tool"
  postedBy: String,         // optional: admin or author name
  dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ExternalResource", externalResourceSchema);
