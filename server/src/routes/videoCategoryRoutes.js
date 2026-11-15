import { Router } from 'express';
import { listVideoCategories } from '../controllers/videoController.js';

const router = Router();

router.get('/', listVideoCategories);

export default router;