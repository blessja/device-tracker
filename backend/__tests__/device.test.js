// __tests__/device.test.js - UPDATED (remove beforeEach cleanup)
const request = require("supertest");
const app = require("../src/app");
const Device = require("../src/models/Device");
const Location = require("../src/models/Location");

describe("Device Routes", () => {
  const testDevice = {
    deviceId: "test_device_001",
    deviceName: "Test Device",
    ownerId: "owner_001",
  };

  // Remove this - setup.js handles cleanup
  // beforeEach(async () => {
  //   await Device.deleteMany({ deviceId: testDevice.deviceId });
  // });

  describe("POST /api/devices/register", () => {
    it("should register a new device", async () => {
      const res = await request(app)
        .post("/api/devices/register")
        .send(testDevice);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.deviceId).toBe(testDevice.deviceId);
    });

    it("should return token for existing device", async () => {
      // Register first time
      const res1 = await request(app)
        .post("/api/devices/register")
        .send(testDevice);

      const token1 = res1.body.data.token;

      // Register same device again
      const res2 = await request(app)
        .post("/api/devices/register")
        .send(testDevice);

      const token2 = res2.body.data.token;

      expect(token1).toBe(token2);
    });

    it("should fail if deviceId is missing", async () => {
      const res = await request(app)
        .post("/api/devices/register")
        .send({ deviceName: testDevice.deviceName });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/devices/status", () => {
    let token;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/devices/register")
        .send(testDevice);
      token = res.body.data.token;
    });

    it("should get device status", async () => {
      const res = await request(app)
        .get("/api/devices/status")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deviceId).toBe(testDevice.deviceId);
    });

    it("should fail without token", async () => {
      const res = await request(app).get("/api/devices/status");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("PUT /api/devices/update", () => {
    let token;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/devices/register")
        .send(testDevice);
      token = res.body.data.token;
    });

    it("should update device successfully", async () => {
      const res = await request(app)
        .put("/api/devices/update")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deviceName: "Updated Device Name",
          isActive: true,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deviceName).toBe("Updated Device Name");
    });
  });
});
