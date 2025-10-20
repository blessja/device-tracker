// src/middlewares/authOwner.js
const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner");

const verifyOwnerToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Authorization token is missing",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Invalid token format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify owner exists and is active
    const owner = await Owner.findOne({
      ownerId: decoded.ownerId,
      isActive: true,
    });

    if (!owner) {
      return res.status(401).json({
        success: false,
        error: "Owner not found or inactive",
      });
    }

    req.ownerId = decoded.ownerId;
    req.owner = owner;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

module.exports = { verifyOwnerToken };
