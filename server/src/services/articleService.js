import Article from '../models/Article.js';
import ApiError from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slugify.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Lists show the card details only (no long text). The detail page loads the full article.
const LIST_FIELDS = '-body -sourceNote';

const paginate = (page, limit, total) => ({ page, limit, total, pages: Math.ceil(total / limit) });

function searchFilter(search) {
  // Escaped so user input is treated as plain text, never as a regex pattern
  const pattern = new RegExp(escapeRegex(search), 'i');
  return [{ title: pattern }, { summary: pattern }];
}

// ---------- Public ----------

export async function listPublicArticles({ page, limit, search, kind }) {
  const filter = { isActive: true };
  if (kind) filter.kind = kind;
  if (search) filter.$or = searchFilter(search);

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .select(LIST_FIELDS)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Article.countDocuments(filter),
  ]);

  return { articles, pagination: paginate(page, limit, total) };
}

export async function getArticleBySlug(slug) {
  const article = await Article.findOne({ slug, isActive: true });
  if (!article) throw new ApiError(404, 'Article not found');
  return article;
}

// ---------- Admin ----------

export async function listAdminArticles({ page, limit, search, kind, isActive }) {
  const filter = {};
  if (kind) filter.kind = kind;
  if (isActive) filter.isActive = isActive === 'true';
  if (search) filter.$or = searchFilter(search);

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .select(LIST_FIELDS)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Article.countDocuments(filter),
  ]);

  return { articles, pagination: paginate(page, limit, total) };
}

export async function getArticleById(id) {
  const article = await Article.findById(id);
  if (!article) throw new ApiError(404, 'Article not found');
  return article;
}

export async function createArticle(data) {
  // The slug is created from the title once and never changes
  const slug = await uniqueSlug(Article, data.title);
  return Article.create({ ...data, slug });
}

export async function updateArticle(id, data) {
  const article = await Article.findById(id);
  if (!article) throw new ApiError(404, 'Article not found');

  article.set(data);
  return article.save();
}

export async function deleteArticle(id) {
  const article = await Article.findById(id);
  if (!article) throw new ApiError(404, 'Article not found');
  await article.deleteOne();
}