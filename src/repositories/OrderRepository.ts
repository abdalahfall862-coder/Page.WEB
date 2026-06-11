import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/Order';

export class OrderRepository {
  private repo: Repository<Order>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        user: true,
        items: {
          product: true
        },
        delivery: true
      }
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: {
        user: true,
        items: {
          product: true
        }
      }
    });
  }

  async findAll(): Promise<Order[]> {
    return this.repo.find({
      relations: {
        user: true,
        items: {
          product: true
        },
        delivery: true
      }
    });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repo.update(id, { status: status as any });
  }

  async create(order: Partial<Order>): Promise<Order> {
    const newOrder = this.repo.create(order);
    return this.repo.save(newOrder);
  }
}