import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/database';

// Import des repositories
import { CategoryRepository } from './repositories/CategoryRepository';
import { ProductRepository } from './repositories/ProductRepository';
import { CartRepository } from './repositories/CartRepository';
import { OrderRepository } from './repositories/OrderRepository';

// Import des services
import { CategoryService } from './services/CategoryService';
import { ProductService } from './services/ProductService';
import { CartService } from './services/CartService';
import { OrderService } from './services/OrderService';

// Import des controllers
import { CategoryController } from './controllers/CategoryController';
import { ProductController } from './controllers/ProductController';
import { CartController } from './controllers/CartController';
import { OrderController } from './controllers/OrderController';

// Import des routes (avec accolades pour export nommé)
import { categoryRoutes } from './routes/categoryRoutes';
import { productRoutes } from './routes/productRoutes';
import { cartRoutes } from './routes/cartRoutes';
import { orderRoutes } from './routes/orderRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('Base de données connectée');

    // Repositories
    const categoryRepo = new CategoryRepository(AppDataSource);
    const productRepo = new ProductRepository(AppDataSource);
    const cartRepo = new CartRepository(AppDataSource);
    const orderRepo = new OrderRepository(AppDataSource);

    // Services
    const categoryService = new CategoryService(categoryRepo);
    const productService = new ProductService(productRepo, categoryRepo);
    const cartService = new CartService(cartRepo, productRepo);
    const orderService = new OrderService(orderRepo, cartRepo);

    // Controllers
    const categoryController = new CategoryController(categoryService);
    const productController = new ProductController(productService);
    const cartController = new CartController(cartService);
    const orderController = new OrderController(orderService);

    // Routes
    app.use('/api/categories', categoryRoutes(categoryController));
    app.use('/api/products', productRoutes(productController));
    app.use('/api/cart', cartRoutes(cartController));
    app.use('/api/orders', orderRoutes(orderController));

    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

startServer();