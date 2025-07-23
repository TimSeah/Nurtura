const express = require("express");
const router = express.Router();
const User = require("../models/UserSettings");


router.post("/", async (req, res) => {
  console.log("📥 Webhook received:", req.body);
  const { type, data } = req.body;

  if (type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = data;
    const email = email_addresses?.[0]?.email_address;

    try {
      await User.create({
        userId: id,
        profile: {
          email: email,
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          // phone, address, emergencyContact will fall back to schema defaults
        },
        // notifications, privacy, appearance will also use defaults
      });

      console.log("✅ Clerk user created in MongoDB");
      return res.status(200).json({ message: "User created and saved" });
    } catch (err) {
      console.error("❌ Error saving user:", err);
      return res.status(500).json({ error: "Failed to save user", details: err.message });
    }
  }

  return res.status(200).json({ message: "Webhook received but not handled" });
});

module.exports = router;
/*
router.post("/", async (req, res) => {
  const { type, data } = req.body;

  if (type === "user.created") {
    if (!data || !data.id || !data.email_addresses?.length) {
      console.warn("⚠️ Missing required user data:", data);
      return res.status(400).json({ error: "Missing required user fields" });
    }

    const { id, email_addresses, first_name, last_name, image_url } = data;
    const email = email_addresses[0].email_address;

    const userObj = {
      clerkId: id,
      email,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url || null,
    };

    try {
      const savedUser = await User.create(userObj);
      console.log("✅ Clerk user saved to MongoDB:", savedUser);
      return res.status(201).json({ message: "User created and saved", user: savedUser });
    } catch (err) {
      console.error("❌ Error saving user to MongoDB:", err);
      return res.status(500).json({ error: "Failed to save user", details: err.message });
    }
  }

  // You can handle other event types here
  return res.status(200).json({ message: `Unhandled event type: ${type}` });
});

module.exports = router;
*/