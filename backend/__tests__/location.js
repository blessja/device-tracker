// __tests__/location.test.js
const request = require("supertest");
const app = require("../src/app");
const Device = require("../src/models/Device");
const Location = require("../src/models/Location");
require("./setup");

describe("Location Routes", () => {
  const testDevice = {
    deviceId: "test_device_002",
    deviceName: "Test Device",
    ownerId: "owner_002",
  };

  let deviceToken;

  beforeEach(async () => {
    await Device.deleteMany({ deviceId: testDevice.deviceId });
    await Location.deleteMany({ deviceId: testDevice.deviceId });

    const res = await request(app)
      .post("/api/devices/register")
      .send(testDevice);
    deviceToken = res.body.data.token;
  });

  describe("POST /api/locations/upload", () => {
    it("should upload location successfully", async () => {
      const res = await request(app)
        .post("/api/locations/upload")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10.5,
          mode: "realtime",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.latitude).toBe(40.7128);
    });

    it("should fail with invalid latitude", async () => {
      const res = await request(app)
        .post("/api/locations/upload")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          latitude: 91, // Invalid - must be -90 to 90
          longitude: -74.006,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail with invalid longitude", async () => {
      const res = await request(app)
        .post("/api/locations/upload")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          latitude: 40.7128,
          longitude: 181, // Invalid - must be -180 to 180
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail without token", async () => {
      const res = await request(app).post("/api/locations/upload").send({
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /api/locations/upload/batch", () => {
    it("should upload batch locations successfully", async () => {
      const locations = [
        { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        { latitude: 40.72, longitude: -74.008, accuracy: 12 },
        { latitude: 40.725, longitude: -74.01, accuracy: 9 },
      ];

      const res = await request(app)
        .post("/api/locations/upload/batch")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send(locations);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
    });

    it("should fail if not array", async () => {
      const res = await request(app)
        .post("/api/locations/upload/batch")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          latitude: 40.7128,
          longitude: -74.006,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/locations/latest/:deviceId", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/locations/upload")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10.5,
          mode: "realtime",
        });
    });

    it("should get latest location", async () => {
      const res = await request(app).get(
        `/api/locations/latest/${testDevice.deviceId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.latitude).toBe(40.7128);
    });

    it("should fail for non-existent device", async () => {
      const res = await request(app).get(
        "/api/locations/latest/nonexistent_device"
      );

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/locations/history/:deviceId", () => {
    beforeEach(async () => {
      const locations = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.72, longitude: -74.008 },
        { latitude: 40.725, longitude: -74.01 },
      ];

      for (const loc of locations) {
        await request(app)
          .post("/api/locations/upload")
          .set("Authorization", `Bearer ${deviceToken}`)
          .send(loc);
      }
    });

    it("should get location history", async () => {
      const res = await request(app).get(
        `/api/locations/history/${testDevice.deviceId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it("should respect limit parameter", async () => {
      const res = await request(app).get(
        `/api/locations/history/${testDevice.deviceId}?limit=2`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBeLessThanOrEqual(2);
    });

    it("should filter by date range", async () => {
      const now = Date.now();
      const res = await request(app).get(
        `/api/locations/history/${testDevice.deviceId}?startTime=${
          now - 3600000
        }&endTime=${now}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
