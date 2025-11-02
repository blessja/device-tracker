const express = require("express");
const deviceRoutes = require("./deviceRoutes");
const locationRoutes = require("./locationRoutes");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/devices", deviceRoutes);
router.use("/api/locations", locationRoutes);

router.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

module.exports = router;
