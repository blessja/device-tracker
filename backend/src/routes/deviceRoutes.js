const express = require("express");
const {
  registerDevice,
  getDeviceStatus,
  getOwnerDevices,
  updateDevice,
} = require("../controllers/deviceController");
const { verifyDeviceToken, verifyOwnerToken } = require("../middlewares/auth");
const {
  validateDeviceRegistration,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

router.post(
  "/register",
  validateDeviceRegistration,
  handleValidationErrors,
  registerDevice
);

router.get("/status", verifyDeviceToken, getDeviceStatus);

router.get("/owner/:ownerId", verifyOwnerToken, getOwnerDevices);

router.put("/update", verifyDeviceToken, updateDevice);

module.exports = router;
