import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { ProductModel } from "../../models/product.model";
import { CartModel } from "../../models/cart.model";
import { OrderModel } from "../../models/order.model";
import { connectTestDb, disconnectTestDb, unique } from "./testDb";

const prefix = `inttest_order_${unique()}`;

let buyerToken: string;
let buyerId: string;
let strangerToken: string;
let adminToken: string;
let productId: string;

beforeAll(async () => {
  await connectTestDb();

  const buyer = await request(app).post("/api/v1/users/register").send({
    firstName: "Buyer",
    lastName: "Tester",
    email: `${prefix}_buyer@example.com`,
    username: `${prefix}buyer`,
    password: "password123",
    phoneNumber: "9800000004",
    gender: "other",
  });
  buyerId = buyer.body.data._id;
  buyerToken = (
    await request(app)
      .post("/api/v1/users/login")
      .send({ email: `${prefix}_buyer@example.com`, password: "password123" })
  ).body.data.token;

  await request(app).post("/api/v1/users/register").send({
    firstName: "Stranger",
    lastName: "Tester",
    email: `${prefix}_stranger@example.com`,
    username: `${prefix}stranger`,
    password: "password123",
    phoneNumber: "9800000005",
    gender: "other",
  });
  strangerToken = (
    await request(app)
      .post("/api/v1/users/login")
      .send({ email: `${prefix}_stranger@example.com`, password: "password123" })
  ).body.data.token;

  const admin = await request(app).post("/api/v1/users/register").send({
    firstName: "Admin",
    lastName: "Tester",
    email: `${prefix}_admin@example.com`,
    username: `${prefix}admin`,
    password: "password123",
    phoneNumber: "9800000006",
    gender: "other",
  });
  await UserModel.findByIdAndUpdate(admin.body.data._id, { role: "admin" });
  adminToken = (
    await request(app)
      .post("/api/v1/users/login")
      .send({ email: `${prefix}_admin@example.com`, password: "password123" })
  ).body.data.token;

  const product = await ProductModel.create({
    name: "Order Test Product",
    slug: `${prefix}-product`,
    description: "for order integration tests",
    category: "test",
    price: 250,
    stock: 2,
  });
  productId = product._id.toString();
});

afterAll(async () => {
  await OrderModel.deleteMany({ buyerId });
  await CartModel.deleteMany({ userId: { $in: [buyerId] } });
  await ProductModel.deleteMany({ slug: `${prefix}-product` });
  await UserModel.deleteMany({ email: { $regex: `^${prefix}` } });
  await disconnectTestDb();
});

describe("Order Integration Tests", () => {
  it("POST /orders rejects a request without a token", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .send({ shippingLocation: "Kathmandu", paymentMethod: "cod" });

    expect(res.status).toBe(401);
  });

  it("POST /orders fails with an empty cart", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ shippingLocation: "Kathmandu", paymentMethod: "cod" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cart is empty/i);
  });

  let orderId: string;

  it("POST /orders creates a COD order and decrements stock", async () => {
    await request(app)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ itemId: productId, quantity: 1 });

    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ shippingLocation: "Kathmandu", paymentMethod: "cod" });

    expect(res.status).toBe(201);
    expect(res.body.data.order.totalAmount).toBe(250);
    orderId = res.body.data.order._id;

    const product = await ProductModel.findById(productId);
    expect(product?.stock).toBe(1);

    const cartRes = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${buyerToken}`);
    expect(cartRes.body.data.items).toEqual([]);
  });

  it("POST /orders fails with 409 when the requested quantity exceeds remaining stock", async () => {
    await request(app)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ itemId: productId, quantity: 5 });

    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ shippingLocation: "Kathmandu", paymentMethod: "cod" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/out of stock/i);

    // stock must be untouched after a failed validation
    const product = await ProductModel.findById(productId);
    expect(product?.stock).toBe(1);
  });

  it("GET /orders returns the buyer's own orders", async () => {
    const res = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((o: any) => o._id === orderId)).toBe(true);
  });

  it("GET /orders/:id returns the order to its buyer", async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set("Authorization", `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(orderId);
  });

  it("GET /orders/:id rejects a user who is not the buyer, a seller, or an admin", async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set("Authorization", `Bearer ${strangerToken}`);

    expect(res.status).toBe(403);
  });

  it("GET /orders/:id is visible to an admin regardless of ownership", async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("PUT /orders/:id/status rejects a non-admin, non-seller caller", async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ status: "shipped" });

    expect(res.status).toBe(403);
  });

  it("PUT /orders/:id/status allows an admin to update status", async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "shipped" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("shipped");
  });

  it("PUT /orders/:id/status rejects an invalid status value", async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "not-a-real-status" });

    expect(res.status).toBe(400);
  });
});
