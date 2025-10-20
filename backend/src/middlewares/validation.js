const { body, query, validationResult } = require("express-validator");

const validateLocationUpload = [
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("accuracy")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Accuracy must be a positive number"),
  body("mode")
    .optional()
    .isIn(["background", "realtime"])
    .withMessage("Mode must be either background or realtime"),
];

const validateBatchLocationUpload = [
  body().isArray().withMessage("Request body must be an array"),
  body("*.latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Each location must have valid latitude"),
  body("*.longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Each location must have valid longitude"),
];

const validateDeviceRegistration = [
  body("deviceId").trim().notEmpty().withMessage("Device ID is required"),
  body("deviceName").trim().notEmpty().withMessage("Device name is required"),
  body("ownerId").trim().notEmpty().withMessage("Owner ID is required"),
];

const validateHistoryQuery = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Limit must be between 1 and 1000"),
  query("startTime")
    .optional()
    .isNumeric()
    .withMessage("Start time must be a valid timestamp"),
  query("endTime")
    .optional()
    .isNumeric()
    .withMessage("End time must be a valid timestamp"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateLocationUpload,
  validateBatchLocationUpload,
  validateDeviceRegistration,
  validateHistoryQuery,
  handleValidationErrors,
};
