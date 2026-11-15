import VideoCategory from '../models/VideoCategory.js';
import Video from '../models/Video.js';
import ApiError from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';

const duplicateError = () =>
  new ApiError(409, 'A category with this name already exists', {
    name: 'A category with this name already exists',
  });

// Public list: only counts videos that are visible on the site
export async function listVideoCategories() {
  const categories = await VideoCategory.find().sort({ name: 1 }).lean();
  return Promise.all(
    categories.map(async (c) => ({
      ...c,
      videoCount: await Video.countDocuments({ category: c._id, isActive: true }),
    }))
  );
}

// Admin list: counts every video, including hidden ones
export async function listVideoCategoriesForAdmin() {
  const categories = await VideoCategory.find().sort({ name: 1 }).lean();
  return Promise.all(
    categories.map(async (c) => ({ ...c, videoCount: await Video.countDocuments({ category: c._id }) }))
  );
}

export async function createVideoCategory({ name, description }) {
  const slug = slugify(name);
  if (!slug) throw new ApiError(400, 'Category name must contain letters or numbers', { name: 'Use letters or numbers' });
  if (await VideoCategory.exists({ slug })) throw duplicateError();

  return VideoCategory.create({ name, slug, description });
}

export async function updateVideoCategory(id, { name, description }) {
  const category = await VideoCategory.findById(id);
  if (!category) throw new ApiError(404, 'Category not found');

  const slug = slugify(name);
  if (!slug) throw new ApiError(400, 'Category name must contain letters or numbers', { name: 'Use letters or numbers' });
  if (await VideoCategory.exists({ slug, _id: { $ne: id } })) throw duplicateError();

  category.name = name;
  category.slug = slug;
  if (description !== undefined) category.description = description;
  return category.save();
}

export async function deleteVideoCategory(id) {
  const category = await VideoCategory.findById(id);
  if (!category) throw new ApiError(404, 'Category not found');

  const inUse = await Video.countDocuments({ category: id });
  if (inUse > 0) {
    throw new ApiError(
      409,
      `This category is used by ${inUse} video${inUse === 1 ? '' : 's'}. Move or delete them first.`
    );
  }

  await category.deleteOne();
}