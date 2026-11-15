import * as productService from '../services/productService.js';
import { parse } from '../middleware/validate.js';
import { publicProductQuerySchema } from '../validators/catalogValidators.js';

// GET /api/v1/products?search=&category=slug&minPrice=&maxPrice=&inStock=true&sort=newest&page=1&limit=12
export async function listProducts(req, res) {
  const query = parse(publicProductQuerySchema, req.query);
  const { products, pagination } = await productService.listPublicProducts(query);
  res.json({ success: true, products, pagination });
}

// GET /api/v1/products/:slug
export async function getProduct(req, res) {
  const product = await productService.getProductBySlug(req.params.slug);
  res.json({ success: true, product });
}

// GET /api/v1/products/:slug/related
export async function getRelated(req, res) {
  const products = await productService.getRelatedProducts(req.params.slug);
  res.json({ success: true, products });
}