const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, "Device ID is required"],
      index: true,
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    mode: {
      type: String,
      enum: ["background", "realtime"],
      default: "background",
    },
  },
  {
    timestamps: true,
    expireAfterSeconds: 7776000, // 90 days TTL
  }
);

// Compound index for efficient queries
locationSchema.index({ deviceId: 1, createdAt: -1 });

module.exports = mongoose.model("Location", locationSchema);
