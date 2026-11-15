import { Router } from 'express';
import { createEnquiry } from '../controllers/enquiryController.js';
import { validateBody } from '../middleware/validate.js';
import { enquiryLimiter } from '../middleware/rateLimit.js';
import { createEnquirySchema } from '../validators/enquiryValidators.js';

const router = Router();

// Limit first, so a flood is stopped before anything else runs
router.post('/', enquiryLimiter, validateBody(createEnquirySchema), createEnquiry);

export default router;