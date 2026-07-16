import { OrderModel, IOrder } from "../models/order.model.js";

export interface IOrderRepository {
  createOrder(order: Partial<IOrder>): Promise<IOrder>;
  getOrderById(id: string): Promise<IOrder | null>;
  getOrderByPidx(pidx: string): Promise<IOrder | null>;
  getOrdersByBuyer(buyerId: string): Promise<IOrder[]>;
  update(id: string, order: Partial<IOrder>): Promise<IOrder | null>;
}

export class OrderMongoRepository implements IOrderRepository {
  async createOrder(order: Partial<IOrder>): Promise<IOrder> {
    const created = await OrderModel.create(order);
    return created;
  }
  async getOrderById(id: string): Promise<IOrder | null> {
    const found = await OrderModel.findOne({ _id: id });
    return found;
  }
  async getOrderByPidx(pidx: string): Promise<IOrder | null> {
    const found = await OrderModel.findOne({ khaltiPidx: pidx });
    return found;
  }
  async getOrdersByBuyer(buyerId: string): Promise<IOrder[]> {
    const found = await OrderModel.find({ buyerId }).sort({ createdAt: -1 });
    return found;
  }
  async update(id: string, order: Partial<IOrder>): Promise<IOrder | null> {
    const updated = await OrderModel.findByIdAndUpdate(id, order, {
      new: true,
    });
    return updated;
  }
}
