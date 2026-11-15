import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const FOLDER = 'dentalcare-kit/products';

function requireCloudinary() {
  if (!env.cloudinary.isConfigured) {
    throw new ApiError(
      503,
      'Image uploads are not set up yet. Add the CLOUDINARY_* values to server/.env and restart the server.'
    );
  }
}

// Sends one image (a Buffer from multer) to Cloudinary. Returns { url, publicId }.
export function uploadImage(buffer) {
  requireCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'webp'], // Cloudinary checks the real file, not just the name
      },
      (error, result) => {
        if (error) return reject(new ApiError(502, `Image upload failed: ${error.message}`));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

// Removes images from Cloudinary. Failures are logged but never block the caller,
// because a leftover image on Cloudinary is harmless and the database is the source of truth.
export async function deleteImages(publicIds) {
  if (!env.cloudinary.isConfigured || publicIds.length === 0) return;

  await Promise.all(
    publicIds.map((id) =>
      cloudinary.uploader.destroy(id).catch((error) => {
        console.error(`Could not delete Cloudinary image ${id}: ${error.message}`);
      })
    )
  );
}