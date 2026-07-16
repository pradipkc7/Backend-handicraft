import { CartMongoRepository } from "../repositories/cart.repository";
import { AddCartItemDTO, UpdateCartItemDTO } from "../dtos/cart.dto";
import { ICart } from "../models/cart.model";
import { HttpException } from "../exceptions/http-exception";

const cartRepository = new CartMongoRepository();

export class CartService {
  private async getOrCreateCart(userId: string): Promise<ICart> {
    const existing = await cartRepository.getCartByUserId(userId);
    if (existing) {
      return existing;
    }
    return cartRepository.createCart(userId);
  }

  // Unpopulated cart: items[].itemId is a raw ObjectId, safe to compare/filter.
  private async getOrCreateRawCart(userId: string): Promise<ICart> {
    const existing = await cartRepository.getRawCartByUserId(userId);
    if (existing) {
      return existing;
    }
    return cartRepository.createCart(userId);
  }

  async getCart(userId: string): Promise<ICart> {
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: string, data: AddCartItemDTO): Promise<ICart> {
    const cart = await this.getOrCreateRawCart(userId);
    const existingItem = cart.items.find(
      (i) => i.itemId.toString() === data.itemId,
    );
    if (existingItem) {
      existingItem.quantity += data.quantity;
    } else {
      cart.items.push({
        itemId: data.itemId as unknown as ICart["items"][0]["itemId"],
        quantity: data.quantity,
      });
    }
    await cartRepository.save(cart);
    const populated = await cartRepository.getCartByUserId(userId);
    return populated as ICart;
  }

  async updateItem(
    userId: string,
    itemId: string,
    data: UpdateCartItemDTO,
  ): Promise<ICart> {
    const cart = await this.getOrCreateRawCart(userId);
    const existingItem = cart.items.find((i) => i.itemId.toString() === itemId);
    if (!existingItem) {
      throw new HttpException(404, "Item not found in cart");
    }
    existingItem.quantity = data.quantity;
    await cartRepository.save(cart);
    const populated = await cartRepository.getCartByUserId(userId);
    return populated as ICart;
  }

  async removeItem(userId: string, itemId: string): Promise<ICart> {
    const cart = await this.getOrCreateRawCart(userId);
    cart.items = cart.items.filter(
      (i) => i.itemId.toString() !== itemId,
    ) as ICart["items"];
    await cartRepository.save(cart);
    const populated = await cartRepository.getCartByUserId(userId);
    return populated as ICart;
  }

  async clearCart(userId: string): Promise<ICart> {
    const cart = await this.getOrCreateRawCart(userId);
    cart.items = [] as unknown as ICart["items"];
    await cartRepository.save(cart);
    const populated = await cartRepository.getCartByUserId(userId);
    return populated as ICart;
  }
}
