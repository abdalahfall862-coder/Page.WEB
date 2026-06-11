import { Request, Response } from 'express';
import { CartService } from '../services/CartService';

export class CartController {
  constructor(private cartService: CartService) {}

  private getUserId(req: Request): string {
    return (req as any).user?.id || req.params.userId || req.body.userId;
  }

  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const cart = await this.cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du panier' });
    }
  }

  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { productId, quantity } = req.body;
      const cart = await this.cartService.addItem(userId, productId, quantity);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'ajout au panier' });
    }
  }

  async updateQuantity(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { productId, quantity } = req.body;
      const cart = await this.cartService.updateItem(userId, productId, quantity);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { productId } = req.body;
      const cart = await this.cartService.removeItem(userId, productId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }

  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      await this.cartService.clearCart(userId);
      res.json({ message: 'Panier vidé' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors du vidage du panier' });
    }
  }
}