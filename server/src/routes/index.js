import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import concernRoutes from './concernRoutes.js';
import videoCategoryRoutes from './videoCategoryRoutes.js';
import videoRoutes from './videoRoutes.js';
import articleRoutes from './articleRoutes.js';
import shopRoutes from './shopRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';

const router = Router();

router.get('/health', getHealth);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/concerns', concernRoutes);
router.use('/video-categories', videoCategoryRoutes);
router.use('/videos', videoRoutes);
router.use('/articles', articleRoutes);
router.use('/shops', shopRoutes);
router.use('/enquiries', enquiryRoutes);

export default router;