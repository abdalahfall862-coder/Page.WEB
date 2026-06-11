import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';

export function orderRoutes(controller: OrderController): Router {
  const router = Router();
  
  router.post('/', (req, res) => controller.createOrder(req, res));
  router.get('/', (req, res) => controller.getAllOrders(req, res));
  router.get('/user', (req, res) => controller.getUserOrders(req, res));
  router.get('/:id', (req, res) => controller.getOrderById(req, res));
  router.put('/:id/status', (req, res) => controller.updateOrderStatus(req, res));
  
  return router;
}