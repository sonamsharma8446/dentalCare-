// 99.5 -> "₹99.50", 120 -> "₹120", 1500 -> "₹1,500"
export function formatPrice(amount) {
  const hasPaise = !Number.isInteger(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Asks Cloudinary for a smaller, optimised version of an image (faster pages).
// Other kinds of URL are returned unchanged.
export function imageUrl(url, width = 600) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}