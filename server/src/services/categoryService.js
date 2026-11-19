import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';

const duplicateError = () =>
  new ApiError(409, 'A category with this name already exists', {
    name: 'A category with this name already exists',
  });

// Public list: only counts products that are visible on the site
export async function listCategories() {
  const categories = await Category.find().sort({ name: 1 }).lean();
  return Promise.all(
    categories.map(async (c) => ({
      ...c,
      productCount: await Product.countDocuments({ category: c._id, isActive: true }),
    }))
  );
}

// Admin list: counts every product, including hidden ones
export async function listCategoriesForAdmin() {
  const categories = await Category.find().sort({ name: 1 }).lean();
  return Promise.all(
    categories.map(async (c) => ({ ...c, productCount: await Product.countDocuments({ category: c._id }) }))
  );
}

export async function createCategory({ name, description }) {
  const slug = slugify(name);
  if (!slug) throw new ApiError(400, 'Category name must contain letters or numbers', { name: 'Use letters or numbers' });
  if (await Category.exists({ slug })) throw duplicateError();

  return Category.create({ name, slug, description });
}

export async function updateCategory(id, { name, description }) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, 'Category not found');

  const slug = slugify(name);
  if (!slug) throw new ApiError(400, 'Category name must contain letters or numbers', { name: 'Use letters or numbers' });
  if (await Category.exists({ slug, _id: { $ne: id } })) throw duplicateError();

  category.name = name;
  category.slug = slug;
  if (description !== undefined) category.description = description;
  return category.save();
}

export async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, 'Category not found');

  const inUse = await Product.countDocuments({ category: id });
  if (inUse > 0) {
    throw new ApiError(
      409,
      `This category is used by ${inUse} product${inUse === 1 ? '' : 's'}. Move or delete them first.`
    );
  }

  await category.deleteOne();
}