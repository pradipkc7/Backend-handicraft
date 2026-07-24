import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { CategoryModel } from "../../models/category.model";
import { connectTestDb, disconnectTestDb, unique } from "./testDb";

const prefix = `inttest_category_${unique()}`;
const categoryName = `${prefix}-category`;

let token: string;
let categoryId: string;

beforeAll(async () => {
  await connectTestDb();

  await request(app).post("/api/v1/users/register").send({
    firstName: "Category",
    lastName: "Tester",
    email: `${prefix}@example.com`,
    username: prefix,
    password: "password123",
    phoneNumber: "9800000010",
    gender: "other",
  });
  token = (
    await request(app)
      .post("/api/v1/users/login")
      .send({ email: `${prefix}@example.com`, password: "password123" })
  ).body.data.token;
});

afterAll(async () => {
  await CategoryModel.deleteMany({ name: { $regex: `^${prefix}` } });
  await UserModel.deleteMany({ email: `${prefix}@example.com` });
  await disconnectTestDb();
});

describe("Category Integration Tests", () => {
  it("GET /categories returns an array", async () => {
    const res = await request(app).get("/api/v1/categories");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("POST /categories rejects a request without a token", async () => {
    const res = await request(app)
      .post("/api/v1/categories")
      .send({ name: categoryName });

    expect(res.status).toBe(401);
  });

  it("POST /categories succeeds for any authenticated user (not just admins)", async () => {
    const res = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: categoryName, description: "created by integration test" });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(categoryName);
    categoryId = res.body.data._id;
  });

  it("POST /categories rejects a duplicate name", async () => {
    const res = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: categoryName });

    expect(res.status).toBe(400);
  });

  it("GET /categories/:id returns the created category", async () => {
    const res = await request(app).get(`/api/v1/categories/${categoryId}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(categoryId);
  });

  it("GET /categories/:id returns 404 for a well-formed but non-existent id", async () => {
    const res = await request(app).get("/api/v1/categories/000000000000000000000000");

    expect(res.status).toBe(404);
  });

  it("PUT /categories/:id updates the category", async () => {
    const res = await request(app)
      .put(`/api/v1/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "inactive" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("inactive");
  });

  it("DELETE /categories/:id removes the category", async () => {
    const res = await request(app)
      .delete(`/api/v1/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const followUp = await request(app).get(`/api/v1/categories/${categoryId}`);
    expect(followUp.status).toBe(404);
  });
});
