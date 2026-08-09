import { CategoryMongoRepository } from "../repositories/category.repository";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/category.dto";
import { ICategory } from "../models/category.model";
import { HttpException } from "../exceptions/http-exception";

const categoryRepository = new CategoryMongoRepository();

export class CategoryService {
  async createCategory(categoryData: CreateCategoryDTO): Promise<ICategory> {
    const existing = await categoryRepository.getCategoryByName(
      categoryData.name,
    );
    if (existing) {
      throw new HttpException(400, "Category name already exists");
    }
    const category = await categoryRepository.createCategory(categoryData);
    return category;
  }

  async getAllCategories(): Promise<ICategory[]> {
    return categoryRepository.getAll();
  }

  async getCategoryById(id: string): Promise<ICategory> {
    const category = await categoryRepository.getCategoryById(id);
    if (!category) {
      throw new HttpException(404, "Category not found");
    }
    return category;
  }

  async updateCategory(
    id: string,
    categoryData: UpdateCategoryDTO,
  ): Promise<ICategory> {
    const existing = await categoryRepository.getCategoryById(id);
    if (!existing) {
      throw new HttpException(404, "Category not found");
    }
    if (categoryData.name && categoryData.name !== existing.name) {
      const duplicate = await categoryRepository.getCategoryByName(
        categoryData.name,
      );
      if (duplicate) {
        throw new HttpException(400, "Category name already exists");
      }
    }
    const updated = await categoryRepository.update(id, categoryData);
    if (!updated) {
      throw new HttpException(404, "Category not found");
    }
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const existing = await categoryRepository.getCategoryById(id);
    if (!existing) {
      throw new HttpException(404, "Category not found");
    }
    return categoryRepository.delete(id);
  }
}
