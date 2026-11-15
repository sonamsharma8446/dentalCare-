import * as concernService from '../services/concernService.js';
import { parse } from '../middleware/validate.js';
import { adminConcernQuerySchema } from '../validators/concernValidators.js';

export async function listConcerns(req, res) {
  const query = parse(adminConcernQuerySchema, req.query);
  const concerns = await concernService.listAdminConcerns(query);
  res.json({ success: true, concerns });
}

export async function getConcern(req, res) {
  const { concern, products } = await concernService.getConcernById(req.params.id);
  res.json({ success: true, concern, products });
}

export async function createConcern(req, res) {
  const concern = await concernService.createConcern(req.body);
  res.status(201).json({ success: true, concern });
}

export async function updateConcern(req, res) {
  const concern = await concernService.updateConcern(req.params.id, req.body);
  res.json({ success: true, concern });
}

export async function deleteConcern(req, res) {
  await concernService.deleteConcern(req.params.id);
  res.json({ success: true, message: 'Concern deleted' });
}

// POST /admin/concerns/:id/products   body: { productId }
export async function addProduct(req, res) {
  const products = await concernService.addProductToConcern(req.params.id, req.body.productId);
  res.status(201).json({ success: true, products });
}

// DELETE /admin/concerns/:id/products/:productId
export async function removeProduct(req, res) {
  const products = await concernService.removeProductFromConcern(req.params.id, req.params.productId);
  res.json({ success: true, products });
}