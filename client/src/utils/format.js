

// Asks Cloudinary for a smaller, optimised version of an image (faster pages).
// Other kinds of URL are returned unchanged.
export function imageUrl(url, width = 600) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}