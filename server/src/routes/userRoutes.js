import { Router } from 'express';
import { updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/authValidators.js';

const router = Router();

// Everything below needs a logged-in user
router.use(protect);

router.put('/profile', validateBody(updateProfileSchema), updateProfile);
router.put('/password', validateBody(changePasswordSchema), changePassword);

export default router;
