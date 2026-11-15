import multer from 'multer';
import ApiError from '../utils/ApiError.js';

export const MAX_FILE_MB = 5;
export const MAX_FILES_PER_UPLOAD = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Files are kept in memory just long enough to be sent to Cloudinary. Nothing is written to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: MAX_FILES_PER_UPLOAD },
  fileFilter(req, file, cb) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Only JPG, PNG or WebP images are allowed'));
    }
    cb(null, true);
  },
});

// Use on a route: router.post('/:id/images', uploadImages, handler). Files arrive in req.files.
// The form field must be named "images".
export const uploadImages = upload.array('images', MAX_FILES_PER_UPLOAD);