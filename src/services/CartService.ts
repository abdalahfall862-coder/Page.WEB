import { CartRepository } from '../repositories/CartRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { Cart } from '../entities/Cart';

export class CartService {
  constructor(
    private cartRepo: CartRepository,
    private productRepo: ProductRepository
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findByUserId(userId);
    
    if (!cart) {
      cart = await this.cartRepo.createOrUpdate(userId, []);
    }
    
    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    const product = await this.productRepo.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = cart.items.find((i: any) => i.product.id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product, quantity } as any);
    }

    return this.cartRepo.createOrUpdate(userId, cart.items);
  }

  async updateItem(userId: string, productId: string, quantity: number): Promise    <Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i: any) => i.product.id === productId);
    
    if (!item) {
      throw new Error('Item not found in cart');
    }

    item.quantity = quantity;
    return this.cartRepo.createOrUpdate(userId, cart.items);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((item: any) => item.product.id !== productId);
    return this.cartRepo.createOrUpdate(userId, cart.items);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepo.deleteByUserId(userId);
  }
}