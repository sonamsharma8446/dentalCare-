import Concern from '../models/Concern.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slugify.js';
import { LIST_FIELDS } from './productService.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Most products shown on one concern page
const PRODUCT_LIMIT = 24;

function searchFilter(search) {
  // Escaped so user input is treated as plain text, never as a regex pattern
  const pattern = new RegExp(escapeRegex(search), 'i');
  return [{ name: pattern }, { summary: pattern }];
}

// ---------- Public ----------

export async function listPublicConcerns({ search }) {
  const filter = { isActive: true };
  if (search) filter.$or = searchFilter(search);

  const concerns = await Concern.find(filter).select('name slug summary').sort({ name: 1 }).lean();
  return Promise.all(
    concerns.map(async (c) => ({
      ...c,
      productCount: await Product.countDocuments({ concerns: c._id, isActive: true }),
    }))
  );
}

export async function getConcernBySlug(slug) {
  const concern = await Concern.findOne({ slug, isActive: true });
  if (!concern) throw new ApiError(404, 'Concern not found');
  return concern;
}

// Visible products linked to a visible concern
export async function getConcernProducts(slug) {
  const concern = await getConcernBySlug(slug);
  return Product.find({ concerns: concern._id, isActive: true })
    .select(LIST_FIELDS)
    .populate('category', 'name slug')
    .sort({ createdAt: -1, _id: -1 })
    .limit(PRODUCT_LIMIT);
}

// ---------- Admin ----------

export async function listAdminConcerns({ search, isActive }) {
  const filter = {};
  if (isActive) filter.isActive = isActive === 'true';
  if (search) filter.$or = searchFilter(search);

  const concerns = await Concern.find(filter).select('name slug summary isActive').sort({ name: 1 }).lean();
  return Promise.all(
    concerns.map(async (c) => ({ ...c, productCount: await Product.countDocuments({ concerns: c._id }) }))
  );
}

// The linked products are loaded separately so the admin screen can show and change them
async function mappedProducts(concernId) {
  return Product.find({ concerns: concernId })
    .select('name slug brand isActive images category')
    .populate('category', 'name')
    .sort({ name: 1 })
    .lean();
}

export async function getConcernById(id) {
  const concern = await Concern.findById(id);
  if (!concern) throw new ApiError(404, 'Concern not found');
  return { concern, products: await mappedProducts(id) };
}

export async function createConcern(data) {
  // The slug is created from the name once and never changes
  const slug = await uniqueSlug(Concern, data.name);
  return Concern.create({ ...data, slug });
}

export async function updateConcern(id, data) {
  const concern = await Concern.findById(id);
  if (!concern) throw new ApiError(404, 'Concern not found');

  concern.set(data);
  return concern.save();
}

export async function deleteConcern(id) {
  const concern = await Concern.findById(id);
  if (!concern) throw new ApiError(404, 'Concern not found');

  await concern.deleteOne();
  // Unlink it from every product so no product keeps a pointer to a concern that no longer exists
  await Product.updateMany({ concerns: id }, { $pull: { concerns: id } });
}

// ---------- Product mapping ----------

export async function addProductToConcern(concernId, productId) {
  if (!(await Concern.exists({ _id: concernId }))) throw new ApiError(404, 'Concern not found');
  if (!(await Product.exists({ _id: productId }))) {
    throw new ApiError(400, 'Product does not exist', { productId: 'Choose an existing product' });
  }

  // $addToSet makes adding the same product twice harmless
  await Product.updateOne({ _id: productId }, { $addToSet: { concerns: concernId } });
  return mappedProducts(concernId);
}

export async function removeProductFromConcern(concernId, productId) {
  if (!(await Concern.exists({ _id: concernId }))) throw new ApiError(404, 'Concern not found');

  await Product.updateOne({ _id: productId }, { $pull: { concerns: concernId } });
  return mappedProducts(concernId);
}