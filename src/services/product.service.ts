import { ProductMongoRepository } from "../repositories/product.repository";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import { HttpException } from "../exceptions/http-exception";
import { IProduct } from "../models/product.model";

const productRepository = new ProductMongoRepository();

export class ProductService {
  async createProduct(productData: CreateProductDTO): Promise<IProduct> {
    const existingProduct = await productRepository.getProductBySlug(
      productData.slug,
    );
    if (existingProduct) {
      throw new HttpException(400, "Product slug already exists");
    }

    return productRepository.createProduct(productData);
  }

  async getProducts(
    page?: string,
    limit?: string,
    search?: string,
    category?: string,
    featured?: string,
  ) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 12;
    const currentSearch = search && search.trim() !== "" ? search : undefined;
    const currentCategory =
      category && category.trim() !== "" ? category : undefined;
    const currentFeatured =
      featured === "true" ? true : featured === "false" ? false : undefined;

    const { data, total } = await productRepository.getAllPaginated(
      currentPage,
      currentLimit,
      currentSearch,
      currentCategory,
      currentFeatured,
    );

    const totalPages = Math.ceil(total / currentLimit);

    return {
      data,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        totalPages,
        total,
      },
    };
  }

  async getProductById(id: string): Promise<IProduct | null> {
    const product = await productRepository.getProductById(id);
    if (!product) {
      throw new HttpException(404, "Product not found");
    }
    return product;
  }

  async getFeaturedProducts(limit = 6): Promise<IProduct[]> {
    const { data } = await productRepository.getAllPaginated(
      1,
      limit,
      undefined,
      undefined,
      true,
    );
    return data;
  }

  async getCategories(): Promise<string[]> {
    const products = await productRepository.getAll();
    const categories = [
      ...new Set(products.map((item) => item.category).filter(Boolean)),
    ];
    return categories;
  }

  async updateProduct(
    id: string,
    productData: UpdateProductDTO,
  ): Promise<IProduct | null> {
    const existingProduct = await productRepository.getProductById(id);
    if (!existingProduct) {
      throw new HttpException(404, "Product not found");
    }

    if (productData.slug && productData.slug !== existingProduct.slug) {
      const existingBySlug = await productRepository.getProductBySlug(
        productData.slug,
      );
      if (existingBySlug) {
        throw new HttpException(400, "Product slug already exists");
      }
    }

    return productRepository.update(id, productData as any);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const existingProduct = await productRepository.getProductById(id);
    if (!existingProduct) {
      throw new HttpException(404, "Product not found");
    }

    const deleted = await productRepository.delete(id);
    if (!deleted) {
      throw new HttpException(500, "Failed to delete product");
    }

    return deleted;
  }
}
