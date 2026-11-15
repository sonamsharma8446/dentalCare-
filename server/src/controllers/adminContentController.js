import * as videoCategoryService from '../services/videoCategoryService.js';
import * as videoService from '../services/videoService.js';
import * as articleService from '../services/articleService.js';
import { parse } from '../middleware/validate.js';
import { adminVideoQuerySchema, adminArticleQuerySchema } from '../validators/contentValidators.js';

// ---------- Video categories ----------

export async function listVideoCategories(req, res) {
  const categories = await videoCategoryService.listVideoCategoriesForAdmin();
  res.json({ success: true, categories });
}

export async function createVideoCategory(req, res) {
  const category = await videoCategoryService.createVideoCategory(req.body);
  res.status(201).json({ success: true, category });
}

export async function updateVideoCategory(req, res) {
  const category = await videoCategoryService.updateVideoCategory(req.params.id, req.body);
  res.json({ success: true, category });
}

export async function deleteVideoCategory(req, res) {
  await videoCategoryService.deleteVideoCategory(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
}

// ---------- Videos ----------

export async function listVideos(req, res) {
  const query = parse(adminVideoQuerySchema, req.query);
  const { videos, pagination } = await videoService.listAdminVideos(query);
  res.json({ success: true, videos, pagination });
}

export async function getVideo(req, res) {
  const video = await videoService.getVideoById(req.params.id);
  res.json({ success: true, video });
}

export async function createVideo(req, res) {
  const video = await videoService.createVideo(req.body);
  res.status(201).json({ success: true, video });
}

export async function updateVideo(req, res) {
  const video = await videoService.updateVideo(req.params.id, req.body);
  res.json({ success: true, video });
}

export async function deleteVideo(req, res) {
  await videoService.deleteVideo(req.params.id);
  res.json({ success: true, message: 'Video deleted' });
}

// ---------- Articles ----------

export async function listArticles(req, res) {
  const query = parse(adminArticleQuerySchema, req.query);
  const { articles, pagination } = await articleService.listAdminArticles(query);
  res.json({ success: true, articles, pagination });
}

export async function getArticle(req, res) {
  const article = await articleService.getArticleById(req.params.id);
  res.json({ success: true, article });
}

export async function createArticle(req, res) {
  const article = await articleService.createArticle(req.body);
  res.status(201).json({ success: true, article });
}

export async function updateArticle(req, res) {
  const article = await articleService.updateArticle(req.params.id, req.body);
  res.json({ success: true, article });
}

export async function deleteArticle(req, res) {
  await articleService.deleteArticle(req.params.id);
  res.json({ success: true, message: 'Article deleted' });
}