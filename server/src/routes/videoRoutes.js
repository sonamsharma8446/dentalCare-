import { Router } from 'express';
import { listVideos, getVideo, getRelatedVideos } from '../controllers/videoController.js';

const router = Router();

router.get('/', listVideos);
router.get('/:slug', getVideo);
router.get('/:slug/related', getRelatedVideos);

export default router;