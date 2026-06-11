import { ProductRepository } from '../repositories/ProductRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { Product } from '../entities/Product';

export class ProductService {
  constructor(
    private productRepo: ProductRepository,
    private categoryRepo: CategoryRepository
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepo.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepo.findById(id);
  }

  async createProduct(data: any): Promise<Product> {
    const category = await this.categoryRepo.findById(data.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    return this.productRepo.create({
      ...data,
      category: category
    });
  }

  async updateProduct(id: string, data: any): Promise<void> {
    if (data.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
      await this.productRepo.update(id, { ...data, category });
    } else {
      await this.productRepo.update(id, data);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await this.productRepo.delete(id);
  }
}