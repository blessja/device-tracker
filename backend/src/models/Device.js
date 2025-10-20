const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      unique: true,
      required: [true, "Device ID is required"],
      trim: true,
    },
    deviceName: {
      type: String,
      required: [true, "Device name is required"],
    },
    ownerId: {
      type: String,
      required: [true, "Owner ID is required"],
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
deviceSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model("Device", deviceSchema);
