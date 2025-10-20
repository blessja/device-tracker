// src/routes/authRoutes.js
const express = require("express");
const {
  registerOwner,
  loginOwner,
  verifyToken,
  getOwnerProfile,
  updateOwnerProfile,
  changePassword,
  logoutOwner,
} = require("../controllers/authController");
const { verifyOwnerToken } = require("../middlewares/authOwner");
const {
  validateOwnerRegistration,
  validateOwnerLogin,
  validatePasswordChange,
  validateProfileUpdate,
  handleValidationErrors,
} = require("../middlewares/validateAuth");

const router = express.Router();

// Public routes
router.post(
  "/register",
  validateOwnerRegistration,
  handleValidationErrors,
  registerOwner
);

router.post("/login", validateOwnerLogin, handleValidationErrors, loginOwner);

// Protected routes
router.get("/verify", verifyOwnerToken, verifyToken);

router.get("/profile", verifyOwnerToken, getOwnerProfile);

router.put(
  "/profile",
  verifyOwnerToken,
  validateProfileUpdate,
  handleValidationErrors,
  updateOwnerProfile
);

router.post(
  "/change-password",
  verifyOwnerToken,
  validatePasswordChange,
  handleValidationErrors,
  changePassword
);

router.post("/logout", verifyOwnerToken, logoutOwner);

module.exports = router;
