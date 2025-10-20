// __tests__/auth.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Owner = require("../src/models/Owner");
require("./setup");

describe("Authentication Routes", () => {
  const testOwner = {
    ownerId: "test_owner_001",
    ownerName: "Test Owner",
    email: "test@example.com",
    password: "password123",
    companyName: "Test Company",
  };

  beforeEach(async () => {
    await Owner.deleteMany({ ownerId: testOwner.ownerId });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new owner successfully", async () => {
      const res = await request(app).post("/api/auth/register").send(testOwner);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.ownerId).toBe(testOwner.ownerId);
      expect(res.body.data.email).toBe(testOwner.email);
    });

    it("should fail if ownerId is missing", async () => {
      const invalidOwner = { ...testOwner };
      delete invalidOwner.ownerId;

      const res = await request(app)
        .post("/api/auth/register")
        .send(invalidOwner);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail if email is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testOwner, email: "invalid-email" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail if password is less than 6 characters", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testOwner, password: "12345" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail if ownerId already exists", async () => {
      // Register first owner
      await request(app).post("/api/auth/register").send(testOwner);

      // Try to register with same ownerId
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          ...testOwner,
          email: "different@example.com",
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should fail if email already exists", async () => {
      // Register first owner
      await request(app).post("/api/auth/register").send(testOwner);

      // Try to register with same email
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          ...testOwner,
          ownerId: "test_owner_002",
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create an owner before login tests
      await request(app).post("/api/auth/register").send(testOwner);
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        ownerId: testOwner.ownerId,
        password: testOwner.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.ownerId).toBe(testOwner.ownerId);
    });

    it("should fail with incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        ownerId: testOwner.ownerId,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should fail if ownerId does not exist", async () => {
      const res = await request(app).post("/api/auth/login").send({
        ownerId: "nonexistent",
        password: testOwner.password,
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should fail if password is not provided", async () => {
      const res = await request(app).post("/api/auth/login").send({
        ownerId: testOwner.ownerId,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/verify", () => {
    let token;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(testOwner);
      token = registerRes.body.data.token;
    });

    it("should verify valid token", async () => {
      const res = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ownerId).toBe(testOwner.ownerId);
    });

    it("should fail without token", async () => {
      const res = await request(app).get("/api/auth/verify");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should fail with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", "Bearer invalid_token");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/auth/profile", () => {
    let token;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(testOwner);
      token = registerRes.body.data.token;
    });

    it("should update profile successfully", async () => {
      const res = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          ownerName: "Updated Name",
          phone: "+1234567890",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ownerName).toBe("Updated Name");
    });

    it("should fail without authorization", async () => {
      const res = await request(app)
        .put("/api/auth/profile")
        .send({ ownerName: "Updated Name" });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /api/auth/change-password", () => {
    let token;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(testOwner);
      token = registerRes.body.data.token;
    });

    it("should change password successfully", async () => {
      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: testOwner.password,
          newPassword: "newpassword123",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should fail with incorrect current password", async () => {
      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "newpassword123",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should fail if new password is too short", async () => {
      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: testOwner.password,
          newPassword: "123",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
