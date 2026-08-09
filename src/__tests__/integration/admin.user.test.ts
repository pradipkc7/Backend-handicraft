import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { connectTestDb, disconnectTestDb, unique } from "./testDb";

const prefix = `inttest_adminuser_${unique()}`;

let adminToken: string;
let userToken: string;
let targetUserId: string;

beforeAll(async () => {
  await connectTestDb();

  const admin = await request(app).post("/api/v1/users/register").send({
    firstName: "Admin",
    lastName: "Tester",
    email: `${prefix}_admin@example.com`,
    username: `${prefix}admin`,
    password: "password123",
    phoneNumber: "9800000007",
    gender: "other",
  });
  await UserModel.findByIdAndUpdate(admin.body.data._id, { role: "admin" });
  adminToken = (
    await request(app)
      .post("/api/v1/users/login")
      .send({ email: `${prefix}_admin@example.com`, password: "password123" })
  ).body.data.token;

  await request(app).post("/api/v1/users/register").send({
    firstName: "Plain",
    lastName: "Tester",
    email: `${prefix}_plain@example.com`,
    username: `${prefix}plain`,
    password: "password123",
    phoneNumber: "9800000008",
    gender: "other",
  });
  userToken = (
    await request(app)
      .post("/api/v1/users/login")
      .send({ email: `${prefix}_plain@example.com`, password: "password123" })
  ).body.data.token;
});

afterAll(async () => {
  await UserModel.deleteMany({ email: { $regex: `^${prefix}` } });
  await disconnectTestDb();
});

const targetPayload = () => ({
  firstName: "Target",
  lastName: "User",
  email: `${prefix}_target@example.com`,
  username: `${prefix}target`,
  password: "password123",
  phoneNumber: "9800000009",
  gender: "other",
});

describe("Admin User Management Integration Tests", () => {
  it("rejects all admin user routes without a token", async () => {
    const res = await request(app).get("/api/v1/admin/users");
    expect(res.status).toBe(401);
  });

  it("rejects a non-admin token", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it("POST /admin/users creates a user as admin", async () => {
    const res = await request(app)
      .post("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(targetPayload());

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(targetPayload().email);
    targetUserId = res.body.data._id;
  });

  it("GET /admin/users lists users with pagination metadata", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({ page: 1, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual(
      expect.objectContaining({ page: 1, limit: 5 }),
    );
  });

  it("GET /admin/users/:id retrieves a specific user", async () => {
    const res = await request(app)
      .get(`/api/v1/admin/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(targetUserId);
  });

  it("PUT /admin/users/:id updates the target user", async () => {
    const res = await request(app)
      .put(`/api/v1/admin/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ firstName: "Renamed" });

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe("Renamed");
  });

  it("PUT /admin/users/:id/password rejects the wrong current password", async () => {
    const res = await request(app)
      .put(`/api/v1/admin/users/${targetUserId}/password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        currentPassword: "wrong-password",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      });

    expect(res.status).toBe(400);
  });

  it("PUT /admin/users/:id/password updates the password with the correct current password", async () => {
    const res = await request(app)
      .put(`/api/v1/admin/users/${targetUserId}/password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        currentPassword: "password123",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      });

    expect(res.status).toBe(200);

    const loginRes = await request(app)
      .post("/api/v1/users/login")
      .send({ email: targetPayload().email, password: "newpassword123" });
    expect(loginRes.status).toBe(200);
  });

  it("DELETE /admin/users/:id removes the target user", async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const followUp = await request(app)
      .get(`/api/v1/admin/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(followUp.status).toBe(404);
  });
});
