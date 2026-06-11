import { OrderRepository } from '../repositories/OrderRepository';
import { CartRepository } from '../repositories/CartRepository';
import { Order } from '../entities/Order';

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private cartRepo: CartRepository
  ) {}

  async createOrder(userId: string, shippingAddress: any): Promise<Order> {
    const cart = await this.cartRepo.findByUserId(userId);
    
    if (!cart || !cart.items.length) {
      throw new Error('Cart is empty');
    }

    const totalAmount = cart.items.reduce((sum: number, item: any) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const order = await this.orderRepo.create({
      user: { id: userId } as any,
      items: cart.items.map((item: any) => ({
        product: { id: item.product.id },
        quantity: item.quantity,
        priceAtPurchase: item.product.price
      })) as any, // ← cast en any pour éviter l'erreur TS
      totalAmount,
      shippingAddress,
      status: 'pending' as any,
      paymentStatus: 'pending' as any
    });

    await this.cartRepo.deleteByUserId(userId);
    return order;
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepo.findById(id);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepo.findByUserId(userId);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepo.findAll();
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    return this.orderRepo.updateStatus(id, status);
  }
}