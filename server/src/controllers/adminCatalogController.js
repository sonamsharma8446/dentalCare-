import * as categoryService from '../services/categoryService.js';
import * as productService from '../services/productService.js';
import { parse } from '../middleware/validate.js';
import { adminProductQuerySchema } from '../validators/catalogValidators.js';

// ---------- Categories ----------

export async function listCategories(req, res) {
  const categories = await categoryService.listCategoriesForAdmin();
  res.json({ success: true, categories });
}

export async function createCategory(req, res) {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, category });
}

export async function updateCategory(req, res) {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.json({ success: true, category });
}

export async function deleteCategory(req, res) {
  await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
}

// ---------- Products ----------

export async function listProducts(req, res) {
  const query = parse(adminProductQuerySchema, req.query);
  const { products, pagination } = await productService.listAdminProducts(query);
  res.json({ success: true, products, pagination });
}

export async function getProduct(req, res) {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, product });
}

export async function createProduct(req, res) {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, product });
}

export async function updateProduct(req, res) {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ success: true, product });
}

export async function deleteProduct(req, res) {
  await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
}

export async function uploadProductImages(req, res) {
  const product = await productService.addImages(req.params.id, req.files);
  res.status(201).json({ success: true, product });
}

export async function deleteProductImage(req, res) {
  const product = await productService.removeImage(req.params.id, req.params.imageId);
  res.json({ success: true, product });
}