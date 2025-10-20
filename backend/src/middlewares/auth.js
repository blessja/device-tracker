const jwt = require("jsonwebtoken");
const Device = require("../models/Device");

const verifyDeviceToken = async (req, res, next) => {
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

    // Verify device exists and is active
    const device = await Device.findOne({
      deviceId: decoded.deviceId,
      isActive: true,
    });

    if (!device) {
      return res.status(401).json({
        success: false,
        error: "Device not found or inactive",
      });
    }

    req.deviceId = decoded.deviceId;
    req.device = device;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.ownerId = decoded.ownerId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

module.exports = { verifyDeviceToken, verifyOwnerToken };
