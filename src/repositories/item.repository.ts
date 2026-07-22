import { ItemModel, IItem } from "../models/item.model.js";

export interface IItemRepository {
  getItemsBySeller(sellerId: string): Promise<IItem[]>;
  getItemsByCategory(categoryId: string): Promise<IItem[]>;
  getAvailableItems(): Promise<IItem[]>;
  // 5 common mandatory methods for a repository
  createItem(item: Partial<IItem>): Promise<IItem>;
  getItemById(id: string): Promise<IItem | null>;
  getAll(): Promise<IItem[]>;
  update(id: string, item: Partial<IItem>): Promise<IItem | null>;
  delete(id: string): Promise<boolean>;
  adjustStock(id: string, delta: number): Promise<IItem | null>;
}

export class ItemMongoRepository implements IItemRepository {
  async createItem(item: Partial<IItem>): Promise<IItem> {
    const created = await ItemModel.create(item);
    return created;
  }
  async getItemById(id: string): Promise<IItem | null> {
    const found = await ItemModel.findOne({ _id: id });
    return found;
  }
  async getAll(): Promise<IItem[]> {
    const found = await ItemModel.find();
    return found;
  }
  async getItemsBySeller(sellerId: string): Promise<IItem[]> {
    const found = await ItemModel.find({ sellerId });
    return found;
  }
  async getItemsByCategory(categoryId: string): Promise<IItem[]> {
    const found = await ItemModel.find({ categoryId });
    return found;
  }
  async getAvailableItems(): Promise<IItem[]> {
    const found = await ItemModel.find({ status: "available" });
    return found;
  }
  async update(id: string, item: Partial<IItem>): Promise<IItem | null> {
    const updated = await ItemModel.findByIdAndUpdate(id, item, {
      new: true,
    });
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    const deleted = await ItemModel.findByIdAndDelete(id);
    return !!deleted;
  }
  async adjustStock(id: string, delta: number): Promise<IItem | null> {
    const filter: Record<string, unknown> = { _id: id };
    if (delta < 0) {
      filter.quantity = { $gte: -delta };
    }
    return ItemModel.findOneAndUpdate(
      filter,
      { $inc: { quantity: delta } },
      { new: true },
    );
  }
}
