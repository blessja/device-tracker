const jwt = require("jsonwebtoken");
const Device = require("../models/Device");
const Location = require("../models/Location");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");

const generateToken = (deviceId) => {
  return jwt.sign({ deviceId }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });
};

exports.registerDevice = asyncHandler(async (req, res) => {
  const { deviceId, deviceName, ownerId } = req.body;

  let device = await Device.findOne({ deviceId });

  if (!device) {
    const token = generateToken(deviceId);
    device = await Device.create({
      deviceId,
      deviceName,
      ownerId,
      token,
    });
  }

  res.status(201).json({
    success: true,
    message: "Device registered successfully",
    data: {
      deviceId: device.deviceId,
      token: device.token,
    },
  });
});

exports.getDeviceStatus = asyncHandler(async (req, res) => {
  const device = await Device.findOne({ deviceId: req.deviceId });

  if (!device) {
    throw new AppError("Device not found", 404);
  }

  res.json({
    success: true,
    data: device,
  });
});

exports.getOwnerDevices = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  const devices = await Device.find({ ownerId });

  const devicesWithLocation = await Promise.all(
    devices.map(async (device) => {
      const latestLocation = await Location.findOne({
        deviceId: device.deviceId,
      })
        .sort({ createdAt: -1 })
        .lean();

      return {
        ...device.toObject(),
        latestLocation,
      };
    })
  );

  res.json({
    success: true,
    count: devicesWithLocation.length,
    data: devicesWithLocation,
  });
});

exports.updateDevice = asyncHandler(async (req, res) => {
  const { isActive, deviceName } = req.body;

  const device = await Device.findOneAndUpdate(
    { deviceId: req.deviceId },
    { isActive, deviceName },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: "Device updated successfully",
    data: device,
  });
});
