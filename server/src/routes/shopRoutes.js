import { Router } from 'express';
import { listShops, listCities, getShop } from '../controllers/shopController.js';

const router = Router();

router.get('/', listShops);
router.get('/cities', listCities); // must come before '/:id'
router.get('/:id', getShop);

export default router;