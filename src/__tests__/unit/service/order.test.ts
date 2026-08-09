jest.mock("../../../repositories/order.repository");
jest.mock("../../../repositories/cart.repository");
jest.mock("../../../repositories/user.repository");
jest.mock("../../../repositories/product.repository");
jest.mock("../../../services/khalti.service");

import { OrderMongoRepository } from "../../../repositories/order.repository";
import { CartMongoRepository } from "../../../repositories/cart.repository";
import { UserMongoRepository } from "../../../repositories/user.repository";
import { ProductMongoRepository } from "../../../repositories/product.repository";
import { KhaltiService } from "../../../services/khalti.service";
import { OrderService } from "../../../services/order.service";

const orderRepo = (OrderMongoRepository as jest.MockedClass<typeof OrderMongoRepository>)
  .mock.instances[0] as jest.Mocked<OrderMongoRepository>;
const cartRepo = (CartMongoRepository as jest.MockedClass<typeof CartMongoRepository>)
  .mock.instances[0] as jest.Mocked<CartMongoRepository>;
const userRepo = (UserMongoRepository as jest.MockedClass<typeof UserMongoRepository>)
  .mock.instances[0] as jest.Mocked<UserMongoRepository>;
const productRepo = (ProductMongoRepository as jest.MockedClass<typeof ProductMongoRepository>)
  .mock.instances[0] as jest.Mocked<ProductMongoRepository>;
const khalti = (KhaltiService as jest.MockedClass<typeof KhaltiService>)
  .mock.instances[0] as jest.Mocked<KhaltiService>;

const orderService = new OrderService();

const buildProduct = (overrides: Record<string, any> = {}) => ({
  _id: "prod1",
  name: "Earring",
  price: 200,
  discountPrice: undefined,
  stock: 4,
  ...overrides,
});

const buildCart = (items: any[]) => ({
  items,
  save: jest.fn(),
});

describe("OrderService.createOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 400 if the cart has no items", async () => {
    cartRepo.getCartByUserId.mockResolvedValue({ items: [] } as any);

    await expect(
      orderService.createOrder("buyer1", {
        shippingLocation: "ktm",
        paymentMethod: "cod",
      }),
    ).rejects.toMatchObject({ status: 400, message: "Cart is empty" });

    expect(orderRepo.createOrder).not.toHaveBeenCalled();
  });

  it("throws 400 if a cart item's product no longer exists", async () => {
    cartRepo.getCartByUserId.mockResolvedValue(
      buildCart([{ itemId: null, quantity: 1 }]) as any,
    );

    await expect(
      orderService.createOrder("buyer1", {
        shippingLocation: "ktm",
        paymentMethod: "cod",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: "One of the items in your cart is no longer available",
    });

    expect(productRepo.adjustStock).not.toHaveBeenCalled();
  });

  it("throws 409 if the requested quantity exceeds available stock", async () => {
    cartRepo.getCartByUserId.mockResolvedValue(
      buildCart([{ itemId: buildProduct({ stock: 2 }), quantity: 5 }]) as any,
    );

    await expect(
      orderService.createOrder("buyer1", {
        shippingLocation: "ktm",
        paymentMethod: "cod",
      }),
    ).rejects.toMatchObject({ status: 409, message: "Earring is out of stock" });

    expect(productRepo.adjustStock).not.toHaveBeenCalled();
  });

  it("does not decrement any stock if a later item in the cart fails validation", async () => {
    cartRepo.getCartByUserId.mockResolvedValue(
      buildCart([
        { itemId: buildProduct({ _id: "p1", stock: 5 }), quantity: 1 },
        { itemId: buildProduct({ _id: "p2", stock: 1 }), quantity: 3 },
      ]) as any,
    );

    await expect(
      orderService.createOrder("buyer1", {
        shippingLocation: "ktm",
        paymentMethod: "cod",
      }),
    ).rejects.toMatchObject({ status: 409 });

    // Validation is a separate pass before any stock is touched, so a
    // failure on item 2 must not have decremented item 1's stock either.
    expect(productRepo.adjustStock).not.toHaveBeenCalled();
  });

  it("throws 409 if stock drops between validation and the atomic decrement", async () => {
    cartRepo.getCartByUserId.mockResolvedValue(
      buildCart([{ itemId: buildProduct({ stock: 4 }), quantity: 1 }]) as any,
    );
    productRepo.adjustStock.mockResolvedValue(null); // lost the race

    await expect(
      orderService.createOrder("buyer1", {
        shippingLocation: "ktm",
        paymentMethod: "cod",
      }),
    ).rejects.toMatchObject({ status: 409, message: "Earring is out of stock" });
  });

  it("creates a COD order, decrements stock, and clears the cart", async () => {
    const cart = buildCart([
      { itemId: buildProduct({ _id: "p1", price: 200, discountPrice: 150, stock: 4 }), quantity: 2 },
    ]);
    cartRepo.getCartByUserId.mockResolvedValue(cart as any);
    productRepo.adjustStock.mockResolvedValue({ stock: 2 } as any);
    orderRepo.createOrder.mockResolvedValue({ _id: "order1" } as any);

    const result = await orderService.createOrder("buyer1", {
      shippingLocation: "ktm",
      paymentMethod: "cod",
    });

    expect(productRepo.adjustStock).toHaveBeenCalledWith("p1", -2);
    // discountPrice wins over price when set
    expect(orderRepo.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        totalAmount: 300, // 150 * 2
        items: [expect.objectContaining({ title: "Earring", price: 150, quantity: 2 })],
      }),
    );
    expect(cartRepo.save).toHaveBeenCalledWith(expect.objectContaining({ items: [] }));
    expect(result).toEqual({ order: { _id: "order1" } });
    expect(khalti.initiatePayment).not.toHaveBeenCalled();
  });

  it("falls back to the regular price when there is no discount price", async () => {
    const cart = buildCart([
      { itemId: buildProduct({ _id: "p1", price: 200, discountPrice: undefined }), quantity: 1 },
    ]);
    cartRepo.getCartByUserId.mockResolvedValue(cart as any);
    productRepo.adjustStock.mockResolvedValue({ stock: 3 } as any);
    orderRepo.createOrder.mockResolvedValue({ _id: "order1" } as any);

    await orderService.createOrder("buyer1", { shippingLocation: "ktm", paymentMethod: "cod" });

    expect(orderRepo.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ totalAmount: 200 }),
    );
  });

  it("initiates Khalti payment, stores the pidx, and clears the cart", async () => {
    const cart = buildCart([
      { itemId: buildProduct({ _id: "p1", price: 200 }), quantity: 1 },
    ]);
    cartRepo.getCartByUserId.mockResolvedValue(cart as any);
    productRepo.adjustStock.mockResolvedValue({ stock: 3 } as any);
    orderRepo.createOrder.mockResolvedValue({ _id: "order1" } as any);
    userRepo.getUserById.mockResolvedValue({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phoneNumber: "9800000000",
    } as any);
    khalti.initiatePayment.mockResolvedValue({
      pidx: "pidx123",
      payment_url: "https://khalti.example/pay",
    } as any);

    const result = await orderService.createOrder("buyer1", {
      shippingLocation: "ktm",
      paymentMethod: "khalti",
    });

    expect(khalti.initiatePayment).toHaveBeenCalledWith(
      expect.objectContaining({ amountPaisa: 20000, purchaseOrderId: "order1" }),
    );
    expect(orderRepo.update).toHaveBeenCalledWith("order1", { khaltiPidx: "pidx123" });
    expect(cartRepo.save).toHaveBeenCalledWith(expect.objectContaining({ items: [] }));
    expect(result).toEqual({
      order: { _id: "order1" },
      paymentUrl: "https://khalti.example/pay",
    });
  });

  it("throws 404 for Khalti checkout if the buyer can't be found", async () => {
    const cart = buildCart([
      { itemId: buildProduct({ _id: "p1", price: 200 }), quantity: 1 },
    ]);
    cartRepo.getCartByUserId.mockResolvedValue(cart as any);
    productRepo.adjustStock.mockResolvedValue({ stock: 3 } as any);
    orderRepo.createOrder.mockResolvedValue({ _id: "order1" } as any);
    userRepo.getUserById.mockResolvedValue(null);

    await expect(
      orderService.createOrder("buyer1", { shippingLocation: "ktm", paymentMethod: "khalti" }),
    ).rejects.toMatchObject({ status: 404, message: "User not found" });

    expect(khalti.initiatePayment).not.toHaveBeenCalled();
  });
});

describe("OrderService.verifyPayment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 404 if no order matches the pidx", async () => {
    orderRepo.getOrderByPidx.mockResolvedValue(null);

    await expect(orderService.verifyPayment("pidx1")).rejects.toMatchObject({
      status: 404,
      message: "Order not found for this payment",
    });
  });

  it("marks the order paid when Khalti reports Completed", async () => {
    orderRepo.getOrderByPidx.mockResolvedValue({ _id: "order1" } as any);
    khalti.lookupPayment.mockResolvedValue({
      status: "Completed",
      transaction_id: "txn1",
    } as any);
    orderRepo.update.mockResolvedValue({ _id: "order1", status: "paid" } as any);

    const result = await orderService.verifyPayment("pidx1");

    expect(orderRepo.update).toHaveBeenCalledWith("order1", {
      paymentStatus: "completed",
      status: "paid",
      khaltiTransactionId: "txn1",
    });
    expect(result).toEqual({ _id: "order1", status: "paid" });
  });

  it("marks the order failed when Khalti reports Expired", async () => {
    orderRepo.getOrderByPidx.mockResolvedValue({ _id: "order1" } as any);
    khalti.lookupPayment.mockResolvedValue({ status: "Expired" } as any);
    orderRepo.update.mockResolvedValue({ _id: "order1", paymentStatus: "failed" } as any);

    await orderService.verifyPayment("pidx1");

    expect(orderRepo.update).toHaveBeenCalledWith("order1", { paymentStatus: "failed" });
  });

  it("returns the order unchanged while payment is still pending", async () => {
    const order = { _id: "order1", paymentStatus: "pending" };
    orderRepo.getOrderByPidx.mockResolvedValue(order as any);
    khalti.lookupPayment.mockResolvedValue({ status: "Pending" } as any);

    const result = await orderService.verifyPayment("pidx1");

    expect(orderRepo.update).not.toHaveBeenCalled();
    expect(result).toBe(order);
  });
});

describe("OrderService access control", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getOrderById allows the buyer", async () => {
    orderRepo.getOrderById.mockResolvedValue({
      buyerId: { toString: () => "buyer1" },
      items: [],
    } as any);

    await expect(orderService.getOrderById("order1", "buyer1")).resolves.toBeDefined();
  });

  it("getOrderById rejects a user who is neither buyer, seller, nor admin", async () => {
    orderRepo.getOrderById.mockResolvedValue({
      buyerId: { toString: () => "buyer1" },
      items: [],
    } as any);

    await expect(orderService.getOrderById("order1", "stranger")).rejects.toMatchObject({
      status: 403,
    });
  });

  it("throws 404 when the order does not exist", async () => {
    orderRepo.getOrderById.mockResolvedValue(null);

    await expect(orderService.getOrderById("missing", "buyer1")).rejects.toMatchObject({
      status: 404,
      message: "Order not found",
    });
  });

  it("updateStatus rejects a non-seller, non-admin caller", async () => {
    orderRepo.getOrderById.mockResolvedValue({ items: [] } as any);

    await expect(
      orderService.updateStatus("order1", "stranger", "shipped"),
    ).rejects.toMatchObject({ status: 403 });

    expect(orderRepo.update).not.toHaveBeenCalled();
  });

  it("updateStatus allows an admin regardless of ownership", async () => {
    orderRepo.getOrderById.mockResolvedValue({ items: [] } as any);
    orderRepo.update.mockResolvedValue({ status: "shipped" } as any);

    await orderService.updateStatus("order1", "admin1", "shipped", "admin");

    expect(orderRepo.update).toHaveBeenCalledWith("order1", { status: "shipped" });
  });
});
