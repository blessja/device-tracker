const Location = require("../models/Location");
const Device = require("../models/Device");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");

exports.uploadLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude, accuracy, mode } = req.body;

  const location = await Location.create({
    deviceId: req.deviceId,
    latitude,
    longitude,
    accuracy: accuracy || 0,
    mode: mode || "realtime",
  });

  await Device.updateOne({ deviceId: req.deviceId }, { lastSeen: new Date() });

  res.status(201).json({
    success: true,
    message: "Location recorded successfully",
    data: location,
  });
});

exports.uploadLocationBatch = asyncHandler(async (req, res) => {
  const locations = req.body.map((loc) => ({
    ...loc,
    deviceId: req.deviceId,
  }));

  await Location.insertMany(locations);

  await Device.updateOne({ deviceId: req.deviceId }, { lastSeen: new Date() });

  res.status(201).json({
    success: true,
    message: `${locations.length} locations recorded successfully`,
    count: locations.length,
  });
});

exports.getLatestLocation = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;

  const location = await Location.findOne({ deviceId })
    .sort({ createdAt: -1 })
    .lean();

  if (!location) {
    throw new AppError("No location data found for this device", 404);
  }

  res.json({
    success: true,
    data: location,
  });
});

exports.getLocationHistory = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { startTime, endTime, limit = 100 } = req.query;

  let query = { deviceId };

  if (startTime || endTime) {
    query.createdAt = {};
    if (startTime) query.createdAt.$gte = new Date(parseInt(startTime));
    if (endTime) query.createdAt.$lte = new Date(parseInt(endTime));
  }

  const locations = await Location.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  res.json({
    success: true,
    count: locations.length,
    data: locations,
  });
});

exports.getLocationsByMode = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { mode, limit = 100 } = req.query;

  const locations = await Location.find({ deviceId, mode })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  res.json({
    success: true,
    count: locations.length,
    data: locations,
  });
});
