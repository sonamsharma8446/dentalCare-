import * as articleService from '../services/articleService.js';
import { parse } from '../middleware/validate.js';
import { publicArticleQuerySchema } from '../validators/contentValidators.js';

// GET /api/v1/articles?search=&kind=article|instruction&page=1&limit=12
export async function listArticles(req, res) {
  const query = parse(publicArticleQuerySchema, req.query);
  const { articles, pagination } = await articleService.listPublicArticles(query);
  res.json({ success: true, articles, pagination });
}

// GET /api/v1/articles/:slug
export async function getArticle(req, res) {
  const article = await articleService.getArticleBySlug(req.params.slug);
  res.json({ success: true, article });
}