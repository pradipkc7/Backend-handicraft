import { ItemMongoRepository } from "../repositories/item.repository";
import { CreateItemDTO, UpdateItemDTO } from "../dtos/item.dto";
import { IItem } from "../models/item.model";
import { HttpException } from "../exceptions/http-exception";

const itemRepository = new ItemMongoRepository();

export interface ItemFilters {
  categoryId?: string;
  sellerId?: string;
  status?: string;
}

export class ItemService {
  async createItem(itemData: CreateItemDTO, sellerId: string): Promise<IItem> {
    const item = await itemRepository.createItem({
      ...itemData,
      sellerId,
    } as unknown as Partial<IItem>);
    return item;
  }

  async getAllItems(filters: ItemFilters): Promise<IItem[]> {
    if (filters.sellerId) {
      return itemRepository.getItemsBySeller(filters.sellerId);
    }
    if (filters.categoryId) {
      return itemRepository.getItemsByCategory(filters.categoryId);
    }
    if (filters.status === "available") {
      return itemRepository.getAvailableItems();
    }
    return itemRepository.getAll();
  }

  async getItemById(id: string): Promise<IItem> {
    const item = await itemRepository.getItemById(id);
    if (!item) {
      throw new HttpException(404, "Item not found");
    }
    return item;
  }

  async updateItem(
    id: string,
    userId: string,
    itemData: UpdateItemDTO,
  ): Promise<IItem> {
    const existing = await itemRepository.getItemById(id);
    if (!existing) {
      throw new HttpException(404, "Item not found");
    }
    if (existing.sellerId.toString() !== userId) {
      throw new HttpException(403, "You are not allowed to update this item");
    }
    const updated = await itemRepository.update(
      id,
      itemData as unknown as Partial<IItem>,
    );
    if (!updated) {
      throw new HttpException(404, "Item not found");
    }
    return updated;
  }

  async deleteItem(id: string, userId: string): Promise<boolean> {
    const existing = await itemRepository.getItemById(id);
    if (!existing) {
      throw new HttpException(404, "Item not found");
    }
    if (existing.sellerId.toString() !== userId) {
      throw new HttpException(403, "You are not allowed to delete this item");
    }
    return itemRepository.delete(id);
  }

  async claimItem(id: string, buyerId: string): Promise<IItem> {
    const existing = await itemRepository.getItemById(id);
    if (!existing) {
      throw new HttpException(404, "Item not found");
    }
    if (existing.sellerId.toString() === buyerId) {
      throw new HttpException(400, "You cannot claim your own item");
    }
    if (existing.status !== "available") {
      throw new HttpException(400, "Item is not available");
    }
    const updated = await itemRepository.update(id, {
      buyerId,
      status: "reserved",
    } as unknown as Partial<IItem>);
    if (!updated) {
      throw new HttpException(404, "Item not found");
    }
    return updated;
  }
}
