import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

export class ProductController {
  constructor(private productService: ProductService) {}

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const product = await this.productService.getProductById(id);
      if (!product) {
        res.status(404).json({ message: 'Produit non trouvé' });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création' });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.productService.updateProduct(id, req.body);
      res.json({ message: 'Produit mis à jour' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.productService.deleteProduct(id);
      res.json({ message: 'Produit supprimé' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  }
}