import * as shopService from '../services/shopService.js';
import { parse } from '../middleware/validate.js';
import { adminShopQuerySchema } from '../validators/shopValidators.js';

export async function listShops(req, res) {
  const query = parse(adminShopQuerySchema, req.query);
  const { shops, pagination } = await shopService.listAdminShops(query);
  res.json({ success: true, shops, pagination });
}

export async function getShop(req, res) {
  const shop = await shopService.getShopById(req.params.id);
  res.json({ success: true, shop });
}

export async function createShop(req, res) {
  const shop = await shopService.createShop(req.body);
  res.status(201).json({ success: true, shop });
}

export async function updateShop(req, res) {
  const shop = await shopService.updateShop(req.params.id, req.body);
  res.json({ success: true, shop });
}

export async function deleteShop(req, res) {
  await shopService.deleteShop(req.params.id);
  res.json({ success: true, message: 'Shop deleted' });
}