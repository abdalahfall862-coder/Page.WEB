import { CategoryRepository } from '../repositories/CategoryRepository';
import { Category } from '../entities/Category';

export class CategoryService {
  constructor(private categoryRepo: CategoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new Error('Catégorie non trouvée');
    }
    return category;
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.categoryRepo.create(data);
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const category = await this.categoryRepo.update(id, data);
    if (!category) {
      throw new Error('Catégorie non trouvée');
    }
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const deleted = await this.categoryRepo.delete(id);
    if (!deleted) {
      throw new Error('Catégorie non trouvée');
    }
  }
}