import mongoose from 'mongoose';
import Shop from '../models/Shop.js';
import ApiError from '../utils/ApiError.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const paginate = (page, limit, total) => ({ page, limit, total, pages: Math.ceil(total / limit) });

// The most shops we will compare by distance in one request. Plenty for a local directory.
const NEARBY_SCAN_LIMIT = 2000;

// Straight-line distance between two points on Earth, in kilometres (haversine formula)
export function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function baseFilter({ search, city }) {
  const filter = {};
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
  if (search) {
    // Escaped so user input is treated as plain text, never as a regex pattern
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { address: pattern }, { city: pattern }, { pincode: pattern }];
  }
  return filter;
}

function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Shop not found');
}

// ---------- Public ----------

export async function listPublicShops({ page, limit, search, city, lat, lng, radiusKm }) {
  const filter = { ...baseFilter({ search, city }), isActive: true };

  // Without a location: alphabetical, paged by the database
  if (lat === undefined) {
    const [shops, total] = await Promise.all([
      Shop.find(filter)
        .sort({ name: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Shop.countDocuments(filter),
    ]);
    return { shops, pagination: paginate(page, limit, total), nearby: false };
  }

  // With a location: only shops that have a map position can be compared. Nearest first.
  filter.latitude = { $ne: null };
  filter.longitude = { $ne: null };
  const candidates = await Shop.find(filter).limit(NEARBY_SCAN_LIMIT).lean();

  let withDistance = candidates.map((shop) => ({
    ...shop,
    distanceKm: Math.round(distanceKm(lat, lng, shop.latitude, shop.longitude) * 10) / 10,
  }));
  if (radiusKm !== undefined) withDistance = withDistance.filter((shop) => shop.distanceKm <= radiusKm);
  withDistance.sort((a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name));

  const total = withDistance.length;
  const shops = withDistance.slice((page - 1) * limit, page * limit);
  return { shops, pagination: paginate(page, limit, total), nearby: true };
}

export async function getShop(id) {
  assertValidId(id);
  const shop = await Shop.findOne({ _id: id, isActive: true });
  if (!shop) throw new ApiError(404, 'Shop not found');
  return shop;
}

// Cities that have at least one visible shop, for the filter drop-down
export async function listCities() {
  const rows = await Shop.find({ isActive: true }).select('city').lean();
  const byLower = new Map();
  for (const { city } of rows) if (!byLower.has(city.toLowerCase())) byLower.set(city.toLowerCase(), city);
  return [...byLower.values()].sort((a, b) => a.localeCompare(b));
}

// ---------- Admin ----------

export async function listAdminShops({ page, limit, search, city, isActive }) {
  const filter = baseFilter({ search, city });
  if (isActive) filter.isActive = isActive === 'true';

  const [shops, total] = await Promise.all([
    Shop.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Shop.countDocuments(filter),
  ]);
  return { shops, pagination: paginate(page, limit, total) };
}

export async function getShopById(id) {
  assertValidId(id);
  const shop = await Shop.findById(id);
  if (!shop) throw new ApiError(404, 'Shop not found');
  return shop;
}

// Empty text from the form means "no value"
function clean(data) {
  const out = { ...data };
  if (out.pincode === '') out.pincode = undefined;
  return out;
}

export async function createShop(data) {
  return Shop.create(clean(data));
}

export async function updateShop(id, data) {
  assertValidId(id);
  const shop = await Shop.findById(id);
  if (!shop) throw new ApiError(404, 'Shop not found');

  const changes = clean(data);
  const latitude = changes.latitude !== undefined ? changes.latitude : shop.latitude;
  const longitude = changes.longitude !== undefined ? changes.longitude : shop.longitude;
  if ((latitude == null) !== (longitude == null)) {
    throw new ApiError(400, 'Enter both latitude and longitude, or leave both empty', {
      latitude: 'Enter both latitude and longitude, or leave both empty',
    });
  }

  if ('pincode' in changes && changes.pincode === undefined) shop.pincode = undefined;
  shop.set(changes);
  if (changes.latitude === null) shop.latitude = null;
  if (changes.longitude === null) shop.longitude = null;
  return shop.save();
}

export async function deleteShop(id) {
  assertValidId(id);
  const shop = await Shop.findById(id);
  if (!shop) throw new ApiError(404, 'Shop not found');
  await shop.deleteOne();
}