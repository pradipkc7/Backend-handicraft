import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { ProductModel } from "../../models/product.model";
import { connectTestDb, disconnectTestDb, unique } from "./testDb";

const prefix = `inttest_product_${unique()}`;

let adminToken: string;
let userToken: string;
let createdProductId: string;

beforeAll(async () => {
  await connectTestDb();

  const adminRegister = await request(app).post("/api/v1/users/register").send({
    firstName: "Admin",
    lastName: "Tester",
    email: `${prefix}_admin@example.com`,
    username: `${prefix}admin`,
    password: "password123",
    phoneNumber: "9800000001",
    gender: "other",
  });
  await UserModel.findByIdAndUpdate(adminRegister.body.data._id, { role: "admin" });
  const adminLogin = await request(app)
    .post("/api/v1/users/login")
    .send({ email: `${prefix}_admin@example.com`, password: "password123" });
  adminToken = adminLogin.body.data.token;

  await request(app).post("/api/v1/users/register").send({
    firstName: "Regular",
    lastName: "Tester",
    email: `${prefix}_user@example.com`,
    username: `${prefix}user`,
    password: "password123",
    phoneNumber: "9800000002",
    gender: "other",
  });
  const userLogin = await request(app)
    .post("/api/v1/users/login")
    .send({ email: `${prefix}_user@example.com`, password: "password123" });
  userToken = userLogin.body.data.token;
});

afterAll(async () => {
  await ProductModel.deleteMany({ slug: { $regex: `^${prefix}` } });
  await UserModel.deleteMany({ email: { $regex: `^${prefix}` } });
  await disconnectTestDb();
});

const productPayload = (suffix: string) => ({
  name: `Integration Test Product ${suffix}`,
  slug: `${prefix}-${suffix}`,
  description: "Created by an integration test.",
  category: `${prefix}-category`,
  price: 500,
  stock: 10,
});

describe("Admin Product Integration Tests", () => {
  it("POST /admin/products rejects a request without a token", async () => {
    const res = await request(app)
      .post("/api/v1/admin/products")
      .send(productPayload("noauth"));

    expect(res.status).toBe(401);
  });

  it("POST /admin/products rejects a non-admin token", async () => {
    const res = await request(app)
      .post("/api/v1/admin/products")
      .set("Authorization", `Bearer ${userToken}`)
      .send(productPayload("nonadmin"));

    expect(res.status).toBe(403);
  });

  it("POST /admin/products rejects an invalid payload", async () => {
    const payload = productPayload("invalid") as any;
    delete payload.slug;

    const res = await request(app)
      .post("/api/v1/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(400);
  });

  it("POST /admin/products creates a product as admin", async () => {
    const res = await request(app)
      .post("/api/v1/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(productPayload("create"));

    expect(res.status).toBe(201);
    expect(res.body.data.stock).toBe(10);
    expect(res.body.data.isActive).toBe(true);
    createdProductId = res.body.data._id;
  });

  it("GET /admin/products/:id retrieves the product as admin", async () => {
    const res = await request(app)
      .get(`/api/v1/admin/products/${createdProductId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(createdProductId);
  });

  it("PUT /admin/products/:id updates the product", async () => {
    const res = await request(app)
      .put(`/api/v1/admin/products/${createdProductId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 750 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(750);
  });

  it("PUT /admin/products/:id as a non-admin is rejected", async () => {
    const res = await request(app)
      .put(`/api/v1/admin/products/${createdProductId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ price: 1 });

    expect(res.status).toBe(403);
  });
});

describe("Public Product Integration Tests", () => {
  it("GET /products lists active products, including the one just created", async () => {
    const res = await request(app)
      .get("/api/v1/products")
      .query({ search: `Integration Test Product create` });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some((p: any) => p._id === createdProductId)).toBe(true);
  });

  it("GET /products/:id returns the product", async () => {
    const res = await request(app).get(`/api/v1/products/${createdProductId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toMatch(/Integration Test Product/);
  });

  it("GET /products/:id returns 404 for a non-existent product", async () => {
    const res = await request(app).get("/api/v1/products/000000000000000000000000");

    expect(res.status).toBe(404);
  });

  it("GET /products/categories includes the test category", async () => {
    const res = await request(app).get("/api/v1/products/categories");

    expect(res.status).toBe(200);
    expect(res.body.data).toContain(`${prefix}-category`);
  });

  it("GET /products/featured returns an array", async () => {
    const res = await request(app).get("/api/v1/products/featured");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("DELETE /admin/products/:id removes the product", async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/products/${createdProductId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const followUp = await request(app).get(`/api/v1/products/${createdProductId}`);
    expect(followUp.status).toBe(404);
  });
});
