import * as categoryService from '../services/categoryService.js';

// GET /api/v1/categories
export async function listCategories(req, res) {
  const categories = await categoryService.listCategories();
  res.json({ success: true, categories });
}