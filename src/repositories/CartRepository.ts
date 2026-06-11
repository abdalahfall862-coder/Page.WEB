import { Repository, DataSource } from 'typeorm';
import { Cart } from '../entities/Cart';

export class CartRepository {
  private repo: Repository<Cart>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Cart);
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      relations: {
        items: {
          product: {
            category: true
          }
        }
      }
    });
  }

  async createOrUpdate(userId: string, items: any[]): Promise<Cart> {
    let cart = await this.findByUserId(userId);

    if (!cart) {
      cart = this.repo.create({ user: { id: userId }, items: [] });
    }

    cart.items = items;
    return this.repo.save(cart);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repo.delete({ user: { id: userId } });
  }
}