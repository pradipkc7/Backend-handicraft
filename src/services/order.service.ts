import { OrderMongoRepository } from "../repositories/order.repository";
import { CartMongoRepository } from "../repositories/cart.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { KhaltiService } from "./khalti.service";
import { CreateOrderDTO } from "../dtos/order.dto";
import { IOrder, IOrderItem } from "../models/order.model";
import { HttpException } from "../exceptions/http-exception";

const orderRepository = new OrderMongoRepository();
const cartRepository = new CartMongoRepository();
const userRepository = new UserMongoRepository();
const khaltiService = new KhaltiService();

export class OrderService {
  async createOrder(
    buyerId: string,
    data: CreateOrderDTO,
  ): Promise<{ order: IOrder; paymentUrl?: string }> {
    const cart = await cartRepository.getCartByUserId(buyerId);
    if (!cart || cart.items.length === 0) {
      throw new HttpException(400, "Cart is empty");
    }

    const orderItems: IOrderItem[] = cart.items.map((cartItem) => {
      const item = cartItem.itemId as any; // populated Item document
      return {
        itemId: item._id,
        sellerId: item.sellerId,
        title: item.title,
        price: item.price,
        quantity: cartItem.quantity,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await orderRepository.createOrder({
      buyerId: buyerId as unknown as IOrder["buyerId"],
      items: orderItems,
      totalAmount,
      shippingLocation: data.shippingLocation,
      paymentMethod: data.paymentMethod,
    });

    if (data.paymentMethod === "khalti") {
      const buyer = await userRepository.getUserById(buyerId);
      if (!buyer) {
        throw new HttpException(404, "User not found");
      }
      const khaltiResponse = await khaltiService.initiatePayment({
        amountPaisa: Math.round(totalAmount * 100),
        purchaseOrderId: order._id.toString(),
        purchaseOrderName: `Order ${order._id.toString()}`,
        customerName: `${buyer.firstName} ${buyer.lastName}`,
        customerEmail: buyer.email,
        customerPhone: buyer.phoneNumber,
      });
      await orderRepository.update(order._id.toString(), {
        khaltiPidx: khaltiResponse.pidx,
      });
      await cartRepository.save(
        Object.assign(cart, { items: [] }),
      );
      return { order, paymentUrl: khaltiResponse.payment_url };
    }

    await cartRepository.save(Object.assign(cart, { items: [] }));
    return { order };
  }

  async verifyPayment(pidx: string): Promise<IOrder> {
    const order = await orderRepository.getOrderByPidx(pidx);
    if (!order) {
      throw new HttpException(404, "Order not found for this payment");
    }
    const lookup = await khaltiService.lookupPayment(pidx);
    if (lookup.status === "Completed") {
      const updated = await orderRepository.update(order._id.toString(), {
        paymentStatus: "completed",
        status: "paid",
        khaltiTransactionId: lookup.transaction_id || undefined,
      });
      return updated as IOrder;
    }
    if (lookup.status === "Expired" || lookup.status === "User canceled") {
      const updated = await orderRepository.update(order._id.toString(), {
        paymentStatus: "failed",
      });
      return updated as IOrder;
    }
    return order;
  }

  async getOrdersByBuyer(buyerId: string): Promise<IOrder[]> {
    return orderRepository.getOrdersByBuyer(buyerId);
  }

  async getOrderById(id: string, userId: string): Promise<IOrder> {
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpException(404, "Order not found");
    }
    const isBuyer = order.buyerId.toString() === userId;
    const isSeller = order.items.some((i) => i.sellerId.toString() === userId);
    if (!isBuyer && !isSeller) {
      throw new HttpException(403, "You are not allowed to view this order");
    }
    return order;
  }

  async updateStatus(
    id: string,
    userId: string,
    status: IOrder["status"],
  ): Promise<IOrder> {
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpException(404, "Order not found");
    }
    const isSeller = order.items.some((i) => i.sellerId.toString() === userId);
    if (!isSeller) {
      throw new HttpException(403, "You are not allowed to update this order");
    }
    const updated = await orderRepository.update(id, { status });
    return updated as IOrder;
  }
}
