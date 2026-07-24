import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { ProductModel } from "../../models/product.model";
import { CartModel } from "../../models/cart.model";
import { connectTestDb, disconnectTestDb, unique } from "./testDb";

const prefix = `inttest_cart_${unique()}`;

let token: string;
let userId: string;
let productId: string;

beforeAll(async () => {
  await connectTestDb();

  const register = await request(app).post("/api/v1/users/register").send({
    firstName: "Cart",
    lastName: "Tester",
    email: `${prefix}@example.com`,
    username: prefix,
    password: "password123",
    phoneNumber: "9800000003",
    gender: "other",
  });
  userId = register.body.data._id;
  const login = await request(app)
    .post("/api/v1/users/login")
    .send({ email: `${prefix}@example.com`, password: "password123" });
  token = login.body.data.token;

  const product = await ProductModel.create({
    name: "Cart Test Product",
    slug: `${prefix}-product`,
    description: "for cart integration tests",
    category: "test",
    price: 100,
    stock: 5,
  });
  productId = product._id.toString();
});

afterAll(async () => {
  await CartModel.deleteMany({ userId });
  await ProductModel.deleteMany({ slug: `${prefix}-product` });
  await UserModel.deleteMany({ email: `${prefix}@example.com` });
  await disconnectTestDb();
});

describe("Cart Integration Tests", () => {
  it("GET /cart rejects a request without a token", async () => {
    const res = await request(app).get("/api/v1/cart");
    expect(res.status).toBe(401);
  });

  it("GET /cart returns an empty cart for a brand-new user", async () => {
    const res = await request(app)
      .get("/api/v1/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });

  it("POST /cart rejects a payload missing itemId", async () => {
    const res = await request(app)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(400);
  });

  it("POST /cart adds an item to the cart", async () => {
    const res = await request(app)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ itemId: productId, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].itemId._id).toBe(productId);
    expect(res.body.data.items[0].quantity).toBe(2);
  });

  it("POST /cart increases quantity when the same item is added again", async () => {
    const res = await request(app)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ itemId: productId, quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].quantity).toBe(3);
  });

  it("PUT /cart/:itemId updates the quantity directly", async () => {
    const res = await request(app)
      .put(`/api/v1/cart/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].quantity).toBe(1);
  });

  it("DELETE /cart/:itemId removes the item", async () => {
    const res = await request(app)
      .delete(`/api/v1/cart/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });

  it("DELETE /cart clears the whole cart", async () => {
    await request(app)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ itemId: productId, quantity: 1 });

    const res = await request(app)
      .delete("/api/v1/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });
});
