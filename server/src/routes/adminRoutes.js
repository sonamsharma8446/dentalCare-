import { Router } from 'express';
import { listUsers, updateUser } from '../controllers/adminUserController.js';
import * as catalog from '../controllers/adminCatalogController.js';
import * as concerns from '../controllers/adminConcernController.js';
import * as content from '../controllers/adminContentController.js';
import * as shops from '../controllers/adminShopController.js';
import * as enquiries from '../controllers/adminEnquiryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { uploadImages } from '../middleware/upload.js';
import { updateUserSchema } from '../validators/adminValidators.js';
import { categorySchema, createProductSchema, updateProductSchema } from '../validators/catalogValidators.js';
import { createConcernSchema, updateConcernSchema, mapProductSchema } from '../validators/concernValidators.js';
import {
  videoCategorySchema,
  createVideoSchema,
  updateVideoSchema,
  createArticleSchema,
  updateArticleSchema,
} from '../validators/contentValidators.js';
import { createShopSchema, updateShopSchema } from '../validators/shopValidators.js';
import { updateEnquirySchema } from '../validators/enquiryValidators.js';

const router = Router();

// Every route in this file requires a logged-in admin.
// Later phases add anything else the admin needs to this same router.
router.use(protect, authorize('admin'));

// Dashboard numbers and reports
router.get('/dashboard', enquiries.getDashboard);
router.get('/reports', enquiries.getReports);

// Users
router.get('/users', listUsers);
router.put('/users/:id', validateBody(updateUserSchema), updateUser);

// Categories
router.get('/categories', catalog.listCategories);
router.post('/categories', validateBody(categorySchema), catalog.createCategory);
router.put('/categories/:id', validateBody(categorySchema), catalog.updateCategory);
router.delete('/categories/:id', catalog.deleteCategory);

// Products
router.get('/products', catalog.listProducts);
router.post('/products', validateBody(createProductSchema), catalog.createProduct);
router.get('/products/:id', catalog.getProduct);
router.put('/products/:id', validateBody(updateProductSchema), catalog.updateProduct);
router.delete('/products/:id', catalog.deleteProduct);

// Product images
router.post('/products/:id/images', uploadImages, catalog.uploadProductImages);
router.delete('/products/:id/images/:imageId', catalog.deleteProductImage);

// Dental concerns
router.get('/concerns', concerns.listConcerns);
router.post('/concerns', validateBody(createConcernSchema), concerns.createConcern);
router.get('/concerns/:id', concerns.getConcern);
router.put('/concerns/:id', validateBody(updateConcernSchema), concerns.updateConcern);
router.delete('/concerns/:id', concerns.deleteConcern);

// Linking products to a concern
router.post('/concerns/:id/products', validateBody(mapProductSchema), concerns.addProduct);
router.delete('/concerns/:id/products/:productId', concerns.removeProduct);

// Video categories
router.get('/video-categories', content.listVideoCategories);
router.post('/video-categories', validateBody(videoCategorySchema), content.createVideoCategory);
router.put('/video-categories/:id', validateBody(videoCategorySchema), content.updateVideoCategory);
router.delete('/video-categories/:id', content.deleteVideoCategory);

// Videos
router.get('/videos', content.listVideos);
router.post('/videos', validateBody(createVideoSchema), content.createVideo);
router.get('/videos/:id', content.getVideo);
router.put('/videos/:id', validateBody(updateVideoSchema), content.updateVideo);
router.delete('/videos/:id', content.deleteVideo);

// Articles and instructions
router.get('/articles', content.listArticles);
router.post('/articles', validateBody(createArticleSchema), content.createArticle);
router.get('/articles/:id', content.getArticle);
router.put('/articles/:id', validateBody(updateArticleSchema), content.updateArticle);
router.delete('/articles/:id', content.deleteArticle);

// Medical shops
router.get('/shops', shops.listShops);
router.post('/shops', validateBody(createShopSchema), shops.createShop);
router.get('/shops/:id', shops.getShop);
router.put('/shops/:id', validateBody(updateShopSchema), shops.updateShop);
router.delete('/shops/:id', shops.deleteShop);

// Enquiries (messages from the Contact page)
router.get('/enquiries', enquiries.listEnquiries);
router.get('/enquiries/export', enquiries.exportEnquiries); // must come before '/enquiries/:id'
router.get('/enquiries/:id', enquiries.getEnquiry);
router.put('/enquiries/:id', validateBody(updateEnquirySchema), enquiries.updateEnquiry);
router.delete('/enquiries/:id', enquiries.deleteEnquiry);

export default router;