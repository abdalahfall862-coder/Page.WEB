import { Router } from 'express';
import { CartController } from '../controllers/CartController';

export function cartRoutes(controller: CartController): Router {
  const router = Router();
  
  router.get('/', (req, res) => controller.getCart(req, res));
  router.post('/add', (req, res) => controller.addToCart(req, res));
  router.put('/update', (req, res) => controller.updateQuantity(req, res));
  router.delete('/remove', (req, res) => controller.removeFromCart(req, res));
  router.delete('/clear', (req, res) => controller.clearCart(req, res));
  
  return router;
}