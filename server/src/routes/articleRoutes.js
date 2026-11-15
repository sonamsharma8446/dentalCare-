import { Router } from 'express';
import { listArticles, getArticle } from '../controllers/articleController.js';

const router = Router();

router.get('/', listArticles);
router.get('/:slug', getArticle);

export default router;