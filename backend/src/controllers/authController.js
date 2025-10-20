// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");

const generateToken = (ownerId) => {
  return jwt.sign({ ownerId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.registerOwner = asyncHandler(async (req, res) => {
  const { ownerId, ownerName, email, password, companyName, phone } = req.body;

  // Check if owner already exists
  const existingOwner = await Owner.findOne({
    $or: [{ ownerId }, { email }],
  });

  if (existingOwner) {
    const field = existingOwner.ownerId === ownerId ? "ownerId" : "email";
    throw new AppError(`${field} already exists`, 409);
  }

  // Create owner
  const owner = await Owner.create({
    ownerId,
    ownerName,
    email,
    password,
    companyName: companyName || "",
    phone: phone || "",
  });

  const token = generateToken(ownerId);

  res.status(201).json({
    success: true,
    message: "Owner registered successfully",
    data: {
      ownerId: owner.ownerId,
      ownerName: owner.ownerName,
      email: owner.email,
      token,
      expiresIn: "7d",
    },
  });
});

exports.loginOwner = asyncHandler(async (req, res) => {
  const { ownerId, password } = req.body;

  // Validate input
  if (!ownerId || !password) {
    throw new AppError("Please provide ownerId and password", 400);
  }

  // Check for owner (select password field)
  const owner = await Owner.findOne({ ownerId }).select("+password");

  if (!owner) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!owner.isActive) {
    throw new AppError("Owner account is inactive", 403);
  }

  // Check password
  const isPasswordValid = await owner.matchPassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  // Update last login
  owner.lastLogin = new Date();
  await owner.save();

  const token = generateToken(ownerId);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      ownerId: owner.ownerId,
      ownerName: owner.ownerName,
      email: owner.email,
      companyName: owner.companyName,
      token,
      expiresIn: "7d",
    },
  });
});

exports.verifyToken = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    data: {
      ownerId: req.owner.ownerId,
      ownerName: req.owner.ownerName,
      email: req.owner.email,
    },
  });
});

exports.getOwnerProfile = asyncHandler(async (req, res) => {
  const owner = await Owner.findOne({ ownerId: req.ownerId });

  if (!owner) {
    throw new AppError("Owner not found", 404);
  }

  res.json({
    success: true,
    data: owner,
  });
});

exports.updateOwnerProfile = asyncHandler(async (req, res) => {
  const { ownerName, email, phone, companyName } = req.body;

  const owner = await Owner.findOneAndUpdate(
    { ownerId: req.ownerId },
    { ownerName, email, phone, companyName },
    { new: true, runValidators: true }
  );

  if (!owner) {
    throw new AppError("Owner not found", 404);
  }

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: owner,
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Please provide current and new password", 400);
  }

  // Get owner with password field
  const owner = await Owner.findOne({ ownerId: req.ownerId }).select(
    "+password"
  );

  if (!owner) {
    throw new AppError("Owner not found", 404);
  }

  // Verify current password
  const isPasswordValid = await owner.matchPassword(currentPassword);

  if (!isPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  // Update password
  owner.password = newPassword;
  await owner.save();

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

exports.logoutOwner = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
});
