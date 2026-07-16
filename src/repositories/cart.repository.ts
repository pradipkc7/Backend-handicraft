import { CartModel, ICart } from "../models/cart.model.js";

export interface ICartRepository {
  getCartByUserId(userId: string): Promise<ICart | null>;
  createCart(userId: string): Promise<ICart>;
  save(cart: ICart): Promise<ICart>;
}

export class CartMongoRepository implements ICartRepository {
  async getCartByUserId(userId: string): Promise<ICart | null> {
    const found = await CartModel.findOne({ userId }).populate("items.itemId");
    return found;
  }
  async createCart(userId: string): Promise<ICart> {
    const created = await CartModel.create({ userId, items: [] });
    return created;
  }
  async save(cart: ICart): Promise<ICart> {
    return cart.save();
  }
}
