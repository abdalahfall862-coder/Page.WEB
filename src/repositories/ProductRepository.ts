import { Repository, DataSource } from 'typeorm';
import { Product } from '../entities/Product';

export class ProductRepository {
  private repo: Repository<Product>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Product);
  }

  async findAll(): Promise<Product[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Product | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        category: true
      }
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.repo.find({
      where: { category: { id: categoryId } },
      relations: {
        category: true
      }
    });
  }

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.repo.create(product);
    return this.repo.save(newProduct);
  }

  async update(id: string, product: Partial<Product>): Promise<void> {
    await this.repo.update(id, product);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}