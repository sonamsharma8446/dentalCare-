import * as concernService from '../services/concernService.js';
import { parse } from '../middleware/validate.js';
import { publicConcernQuerySchema } from '../validators/concernValidators.js';

// GET /api/v1/concerns?search=
export async function listConcerns(req, res) {
  const query = parse(publicConcernQuerySchema, req.query);
  const concerns = await concernService.listPublicConcerns(query);
  res.json({ success: true, concerns });
}

// GET /api/v1/concerns/:slug
export async function getConcern(req, res) {
  const concern = await concernService.getConcernBySlug(req.params.slug);
  res.json({ success: true, concern });
}

// GET /api/v1/concerns/:slug/products
export async function getConcernProducts(req, res) {
  const products = await concernService.getConcernProducts(req.params.slug);
  res.json({ success: true, products });
}