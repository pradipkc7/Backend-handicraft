import { ProductModel, IProduct } from "../models/product.model";

export interface IProductRepository {
  createProduct(product: Partial<IProduct>): Promise<IProduct>;
  getProductById(id: string): Promise<IProduct | null>;
  getProductBySlug(slug: string): Promise<IProduct | null>;
  getAll(): Promise<IProduct[]>;
  update(id: string, product: Partial<IProduct>): Promise<IProduct | null>;
  delete(id: string): Promise<boolean>;
  getAllPaginated(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    featured?: boolean,
  ): Promise<{ data: IProduct[]; total: number }>;
}

export class ProductMongoRepository implements IProductRepository {
  async createProduct(product: Partial<IProduct>): Promise<IProduct> {
    const created = await ProductModel.create(product);
    return created;
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return ProductModel.findById(id);
  }

  async getProductBySlug(slug: string): Promise<IProduct | null> {
    return ProductModel.findOne({ slug });
  }

  async getAll(): Promise<IProduct[]> {
    return ProductModel.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async update(
    id: string,
    product: Partial<IProduct>,
  ): Promise<IProduct | null> {
    return ProductModel.findByIdAndUpdate(id, product, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await ProductModel.findByIdAndDelete(id);
    return !!deleted;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    featured?: boolean,
  ): Promise<{ data: IProduct[]; total: number }> {
    const query: any = { isActive: true };

    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category.trim() !== "") {
      query.category = { $regex: category, $options: "i" };
    }

    if (typeof featured === "boolean") {
      query.featured = featured;
    }

    const total = await ProductModel.countDocuments(query);
    const data = await ProductModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { data, total };
  }
}
