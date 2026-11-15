import * as shopService from '../services/shopService.js';
import { parse } from '../middleware/validate.js';
import { publicShopQuerySchema } from '../validators/shopValidators.js';

// GET /api/v1/shops?search=&city=&lat=&lng=&radiusKm=&page=&limit=
// With lat and lng the shops are sorted nearest first and each one gets a distanceKm.
// The visitor's position is used for this request only and is never stored.
export async function listShops(req, res) {
  const query = parse(publicShopQuerySchema, req.query);
  const { shops, pagination, nearby } = await shopService.listPublicShops(query);
  res.json({ success: true, shops, pagination, nearby });
}

// GET /api/v1/shops/cities
export async function listCities(req, res) {
  const cities = await shopService.listCities();
  res.json({ success: true, cities });
}

// GET /api/v1/shops/:id
export async function getShop(req, res) {
  const shop = await shopService.getShop(req.params.id);
  res.json({ success: true, shop });
}