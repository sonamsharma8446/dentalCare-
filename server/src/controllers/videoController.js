import * as videoService from '../services/videoService.js';
import * as videoCategoryService from '../services/videoCategoryService.js';
import { parse } from '../middleware/validate.js';
import { publicVideoQuerySchema } from '../validators/contentValidators.js';

// GET /api/v1/video-categories
export async function listVideoCategories(req, res) {
  const categories = await videoCategoryService.listVideoCategories();
  res.json({ success: true, categories });
}

// GET /api/v1/videos?search=&category=slug&page=1&limit=12
export async function listVideos(req, res) {
  const query = parse(publicVideoQuerySchema, req.query);
  const { videos, pagination } = await videoService.listPublicVideos(query);
  res.json({ success: true, videos, pagination });
}

// GET /api/v1/videos/:slug
export async function getVideo(req, res) {
  const video = await videoService.getVideoBySlug(req.params.slug);
  res.json({ success: true, video });
}

// GET /api/v1/videos/:slug/related
export async function getRelatedVideos(req, res) {
  const videos = await videoService.getRelatedVideos(req.params.slug);
  res.json({ success: true, videos });
}