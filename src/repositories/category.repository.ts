import { CategoryModel, ICategory } from "../models/category.model.js";

export interface ICategoryRepository {
  getCategoryByName(name: string): Promise<ICategory | null>;
  // 5 common mandatory methods for a repository
  createCategory(category: Partial<ICategory>): Promise<ICategory>;
  getCategoryById(id: string): Promise<ICategory | null>;
  getAll(): Promise<ICategory[]>;
  update(id: string, category: Partial<ICategory>): Promise<ICategory | null>;
  delete(id: string): Promise<boolean>;
}

export class CategoryMongoRepository implements ICategoryRepository {
  async getCategoryByName(name: string): Promise<ICategory | null> {
    const found = await CategoryModel.findOne({ name });
    return found;
  }
  async createCategory(category: Partial<ICategory>): Promise<ICategory> {
    const created = await CategoryModel.create(category);
    return created;
  }
  async getCategoryById(id: string): Promise<ICategory | null> {
    const found = await CategoryModel.findOne({ _id: id });
    return found;
  }
  async getAll(): Promise<ICategory[]> {
    const found = await CategoryModel.find();
    return found;
  }
  async update(
    id: string,
    category: Partial<ICategory>,
  ): Promise<ICategory | null> {
    const updated = await CategoryModel.findByIdAndUpdate(id, category, {
      new: true,
    });
    return updated;
  }
  async delete(id: string): Promise<boolean> {
    const deleted = await CategoryModel.findByIdAndDelete(id);
    return !!deleted;
  }
}
