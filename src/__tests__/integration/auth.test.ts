import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { connectTestDb, disconnectTestDb, unique } from "./testDb";

const prefix = `inttest_auth_${unique()}`;

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await UserModel.deleteMany({ email: { $regex: `^${prefix}` } });
  await disconnectTestDb();
});

const registerPayload = (suffix: string) => ({
  firstName: "Test",
  lastName: "User",
  email: `${prefix}_${suffix}@example.com`,
  username: `${prefix}${suffix}`,
  password: "password123",
  phoneNumber: "9800000000",
  gender: "other",
});

describe("Auth Integration Tests", () => {
  describe("POST /api/v1/users/register", () => {
    it("registers a new user", async () => {
      const res = await request(app)
        .post("/api/v1/users/register")
        .send(registerPayload("register"));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(`${prefix}_register@example.com`);
      expect(res.body.data.password).toBeUndefined();
    });

    it("rejects registration with a missing required field", async () => {
      const payload = registerPayload("missing") as any;
      delete payload.phoneNumber;

      const res = await request(app).post("/api/v1/users/register").send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects registration with an invalid email", async () => {
      const payload = { ...registerPayload("bademail"), email: "not-an-email" };

      const res = await request(app).post("/api/v1/users/register").send(payload);

      expect(res.status).toBe(400);
    });

    it("rejects a duplicate email", async () => {
      const payload = registerPayload("dup");
      await request(app).post("/api/v1/users/register").send(payload);

      const res = await request(app)
        .post("/api/v1/users/register")
        .send({ ...payload, username: `${payload.username}2` });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/email/i);
    });

    it("rejects a duplicate username", async () => {
      const payload = registerPayload("dupuser");
      await request(app).post("/api/v1/users/register").send(payload);

      const res = await request(app)
        .post("/api/v1/users/register")
        .send({ ...payload, email: `${prefix}_dupuser2@example.com` });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/username/i);
    });
  });

  describe("POST /api/v1/users/login", () => {
    const payload = registerPayload("login");

    beforeAll(async () => {
      await request(app).post("/api/v1/users/register").send(payload);
    });

    it("logs in with correct credentials", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({ email: payload.email, password: payload.password });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toEqual(expect.any(String));
      expect(res.body.data.user.email).toBe(payload.email);
    });

    it("rejects an incorrect password", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({ email: payload.email, password: "wrong-password" });

      expect(res.status).toBe(400);
    });

    it("rejects a login for a non-existent email", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({ email: `${prefix}_nobody@example.com`, password: "password123" });

      expect(res.status).toBe(400);
    });
  });

  describe("Authenticated user endpoints", () => {
    const payload = registerPayload("me");
    let token: string;

    beforeAll(async () => {
      await request(app).post("/api/v1/users/register").send(payload);
      const loginRes = await request(app)
        .post("/api/v1/users/login")
        .send({ email: payload.email, password: payload.password });
      token = loginRes.body.data.token;
    });

    it("GET /whoami rejects a request without a token", async () => {
      const res = await request(app).get("/api/v1/users/whoami");
      expect(res.status).toBe(401);
    });

    it("GET /whoami rejects a malformed token", async () => {
      const res = await request(app)
        .get("/api/v1/users/whoami")
        .set("Authorization", "Bearer not-a-real-token");
      expect(res.status).toBe(401);
    });

    it("GET /whoami returns the current user without the password field", async () => {
      const res = await request(app)
        .get("/api/v1/users/whoami")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(payload.email);
      expect(res.body.data.password).toBeUndefined();
    });

    it("PUT /update-profile updates the logged-in user's profile", async () => {
      const res = await request(app)
        .put("/api/v1/users/update")
        .set("Authorization", `Bearer ${token}`)
        .send({ firstName: "Updated" });

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe("Updated");
    });

    it("PATCH /change-password rejects an incorrect old password", async () => {
      const res = await request(app)
        .patch("/api/v1/users/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({ oldPassword: "wrong-password", newPassword: "newpassword123" });

      expect(res.status).toBe(400);
    });

    it("PATCH /change-password succeeds with the correct old password", async () => {
      const res = await request(app)
        .patch("/api/v1/users/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({ oldPassword: payload.password, newPassword: "newpassword123" });

      expect(res.status).toBe(200);

      // the new password should now work for login
      const loginRes = await request(app)
        .post("/api/v1/users/login")
        .send({ email: payload.email, password: "newpassword123" });
      expect(loginRes.status).toBe(200);
    });
  });

  describe("POST /api/v1/users/forgot-password", () => {
    it("responds successfully without revealing whether the email exists", async () => {
      const res = await request(app)
        .post("/api/v1/users/forgot-password")
        .send({ email: `${prefix}_ghost@example.com` });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("rejects an invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/users/forgot-password")
        .send({ email: "not-an-email" });

      expect(res.status).toBe(400);
    });
  });
});
