import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slugify.js';
import { uploadImage, deleteImages } from './imageService.js';

export const MAX_IMAGES_PER_PRODUCT = 8;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Lists show a summary only. The detail page loads the full product.
export const LIST_FIELDS = '-usageInstructions -precautions ';

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: -1 },
  name_asc: { name: 1, _id: 1 },
};

const paginate = (page, limit, total) => ({ page, limit, total, pages: Math.ceil(total / limit) });

function searchFilter(search) {
  // Escaped so user input is treated as plain text, never as a regex pattern
  const pattern = new RegExp(escapeRegex(search), 'i');
  return [{ name: pattern }, { brand: pattern }];
}

async function assertCategoryExists(categoryId) {
  if (!(await Category.exists({ _id: categoryId }))) {
    throw new ApiError(400, 'Category does not exist', { category: 'Choose an existing category' });
  }
}

// ---------- Public ----------

export async function listPublicProducts({ page, limit, search, category, minPrice, maxPrice, inStock, sort }) {
  const filter = { isActive: true };

  if (category) {
    const found = await Category.findOne({ slug: category });
    if (!found) return { products: [], pagination: paginate(page, limit, 0) }; // unknown category: nothing to show
    filter.category = found._id;
  }
  if (search) filter.$or = searchFilter(search);
  if (inStock) filter.inStock = true;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(LIST_FIELDS)
      .populate('category', 'name slug')
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return { products, pagination: paginate(page, limit, total) };
}

export async function getProductBySlug(slug) {
  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug')
    // Only concerns that are visible on the site (hidden ones are left out)
    .populate({ path: 'concerns', match: { isActive: true }, select: 'name slug summary' });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

export async function getRelatedProducts(slug, count = 4) {
  const product = await Product.findOne({ slug, isActive: true });
  if (!product) throw new ApiError(404, 'Product not found');

  return Product.find({ category: product.category, isActive: true, _id: { $ne: product._id } })
    .select(LIST_FIELDS)
    .populate('category', 'name slug')
    .sort({ createdAt: -1, _id: -1 })
    .limit(count);
}

// ---------- Admin ----------

export async function listAdminProducts({ page, limit, search, category, isActive }) {
  const filter = {};
  if (category) filter.category = category;
  if (isActive) filter.isActive = isActive === 'true';
  if (search) filter.$or = searchFilter(search);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(LIST_FIELDS)
      .populate('category', 'name slug')
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return { products, pagination: paginate(page, limit, total) };
}

export async function getProductById(id) {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

export async function createProduct(data) {
  await assertCategoryExists(data.category);
  // The slug is created from the name once and never changes, so product links keep working after edits
  const slug = await uniqueSlug(Product, data.name);
  const product = await Product.create({ ...data, slug });
  return product.populate('category', 'name slug');
}

export async function updateProduct(id, data) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');

  if (data.category) await assertCategoryExists(data.category);

  product.set(data);
  await product.save();
  return product.populate('category', 'name slug');
}

export async function deleteProduct(id) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');

  await product.deleteOne();
  await deleteImages(product.images.map((img) => img.publicId));
}

export async function addImages(id, files) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  if (!files || files.length === 0) throw new ApiError(400, 'Choose at least one image to upload');

  if (product.images.length + files.length > MAX_IMAGES_PER_PRODUCT) {
    throw new ApiError(
      400,
      `A product can have up to ${MAX_IMAGES_PER_PRODUCT} images. This one has ${product.images.length}.`
    );
  }

  const results = await Promise.allSettled(files.map((file) => uploadImage(file.buffer)));
  const uploaded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const failed = results.find((r) => r.status === 'rejected');

  if (failed) {
    // All or nothing: remove the ones that did upload so nothing is left behind
    await deleteImages(uploaded.map((img) => img.publicId));
    throw failed.reason;
  }

  product.images.push(...uploaded);
  await product.save();
  return product;
}

export async function removeImage(id, imageId) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');

  const image = product.images.id(imageId);
  if (!image) throw new ApiError(404, 'Image not found');

  const { publicId } = image;
  // Keep every image except the one being removed
  product.images = product.images.filter((img) => !img._id.equals(imageId));
  await product.save();
  await deleteImages([publicId]);
  return product;
}