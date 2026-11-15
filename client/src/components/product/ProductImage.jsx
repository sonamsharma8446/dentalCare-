import { imageUrl } from '../../utils/format';

// Shows a product image, or a plain placeholder when the product has none yet.
export default function ProductImage({ image, alt, width = 600, className = '' }) {
  if (!image) {
    return (
      <div
        role="img"
        aria-label="No image available"
        className={`flex items-center justify-center bg-slate-100 text-xs text-slate-400 ${className}`}
      >
        No image
      </div>
    );
  }

  return <img src={imageUrl(image.url, width)} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}