const express = require("express");
const {
  uploadLocation,
  uploadLocationBatch,
  getLatestLocation,
  getLocationHistory,
  getLocationsByMode,
} = require("../controllers/locationController");
const { verifyDeviceToken } = require("../middlewares/auth");
const {
  validateLocationUpload,
  validateBatchLocationUpload,
  validateHistoryQuery,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

router.post(
  "/upload",
  verifyDeviceToken,
  validateLocationUpload,
  handleValidationErrors,
  uploadLocation
);

router.post(
  "/upload/batch",
  verifyDeviceToken,
  validateBatchLocationUpload,
  handleValidationErrors,
  uploadLocationBatch
);

router.get("/latest/:deviceId", getLatestLocation);

router.get(
  "/history/:deviceId",
  validateHistoryQuery,
  handleValidationErrors,
  getLocationHistory
);

router.get("/mode/:deviceId", getLocationsByMode);

module.exports = router;
