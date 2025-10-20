// src/middlewares/validateAuth.js
const { body, validationResult } = require("express-validator");

const validateOwnerRegistration = [
  body("ownerId").trim().notEmpty().withMessage("Owner ID is required"),
  body("ownerName").trim().notEmpty().withMessage("Owner name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("companyName").optional().trim(),
  body("phone").optional().trim(),
];

const validateOwnerLogin = [
  body("ownerId").trim().notEmpty().withMessage("Owner ID is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

const validateProfileUpdate = [
  body("ownerName").optional().trim().notEmpty(),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("phone").optional().trim(),
  body("companyName").optional().trim(),
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
  validateOwnerRegistration,
  validateOwnerLogin,
  validatePasswordChange,
  validateProfileUpdate,
  handleValidationErrors,
};
