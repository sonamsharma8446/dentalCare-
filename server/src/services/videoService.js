import Video from '../models/Video.js';
import VideoCategory from '../models/VideoCategory.js';
import ApiError from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slugify.js';
import { extractYouTubeId } from '../utils/youtube.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Lists show the card details only. The detail page loads the full video.
const LIST_FIELDS = '-description -credit';

const paginate = (page, limit, total) => ({ page, limit, total, pages: Math.ceil(total / limit) });

function searchFilter(search) {
  // Escaped so user input is treated as plain text, never as a regex pattern
  const pattern = new RegExp(escapeRegex(search), 'i');
  return [{ title: pattern }, { description: pattern }];
}

async function assertCategoryExists(categoryId) {
  if (!(await VideoCategory.exists({ _id: categoryId }))) {
    throw new ApiError(400, 'Category does not exist', { category: 'Choose an existing category' });
  }
}

// The form sends a link; we store only the 11-character id
function withYouTubeId({ youtubeUrl, ...rest }) {
  if (youtubeUrl === undefined) return rest;
  return { ...rest, youtubeId: extractYouTubeId(youtubeUrl) };
}

// ---------- Public ----------

export async function listPublicVideos({ page, limit, search, category }) {
  const filter = { isActive: true };

  if (category) {
    const found = await VideoCategory.findOne({ slug: category });
    if (!found) return { videos: [], pagination: paginate(page, limit, 0) }; // unknown category: nothing to show
    filter.category = found._id;
  }
  if (search) filter.$or = searchFilter(search);

  const [videos, total] = await Promise.all([
    Video.find(filter)
      .select(LIST_FIELDS)
      .populate('category', 'name slug')
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Video.countDocuments(filter),
  ]);

  return { videos, pagination: paginate(page, limit, total) };
}

export async function getVideoBySlug(slug) {
  const video = await Video.findOne({ slug, isActive: true }).populate('category', 'name slug');
  if (!video) throw new ApiError(404, 'Video not found');
  return video;
}

export async function getRelatedVideos(slug, count = 4) {
  const video = await Video.findOne({ slug, isActive: true });
  if (!video) throw new ApiError(404, 'Video not found');

  return Video.find({ category: video.category, isActive: true, _id: { $ne: video._id } })
    .select(LIST_FIELDS)
    .populate('category', 'name slug')
    .sort({ createdAt: -1, _id: -1 })
    .limit(count);
}

// ---------- Admin ----------

export async function listAdminVideos({ page, limit, search, category, isActive }) {
  const filter = {};
  if (category) filter.category = category;
  if (isActive) filter.isActive = isActive === 'true';
  if (search) filter.$or = searchFilter(search);

  const [videos, total] = await Promise.all([
    Video.find(filter)
      .select(LIST_FIELDS)
      .populate('category', 'name slug')
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Video.countDocuments(filter),
  ]);

  return { videos, pagination: paginate(page, limit, total) };
}

export async function getVideoById(id) {
  const video = await Video.findById(id).populate('category', 'name slug');
  if (!video) throw new ApiError(404, 'Video not found');
  return video;
}

export async function createVideo(data) {
  await assertCategoryExists(data.category);
  // The slug is created from the title once and never changes, so video links keep working after edits
  const slug = await uniqueSlug(Video, data.title);
  const video = await Video.create({ ...withYouTubeId(data), slug });
  return video.populate('category', 'name slug');
}

export async function updateVideo(id, data) {
  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, 'Video not found');

  if (data.category) await assertCategoryExists(data.category);

  video.set(withYouTubeId(data));
  await video.save();
  return video.populate('category', 'name slug');
}

export async function deleteVideo(id) {
  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, 'Video not found');
  await video.deleteOne();
}