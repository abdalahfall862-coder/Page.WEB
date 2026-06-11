import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';

export class OrderController {
  constructor(private orderService: OrderService) {}

  private getUserId(req: Request): string {
    return (req as any).user?.id || req.params.userId || req.body.userId;
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { shippingAddress } = req.body;
      const order = await this.orderService.createOrder(userId, shippingAddress);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de la commande' });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const order = await this.orderService.getOrderById(id);
      if (!order) {
        res.status(404).json({ message: 'Commande non trouvée' });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const orders = await this.orderService.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      await this.orderService.updateOrderStatus(id, status);
      res.json({ message: 'Statut mis à jour' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }
}