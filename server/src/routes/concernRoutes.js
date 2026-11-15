import { Router } from 'express';
import { listConcerns, getConcern, getConcernProducts } from '../controllers/concernController.js';

const router = Router();

router.get('/', listConcerns);
router.get('/:slug', getConcern);
router.get('/:slug/products', getConcernProducts);

export default router;