import { useRef, useState } from 'react';
import { uploadProductImages, deleteProductImage } from '../../api/adminCatalogApi';
import Alert from '../common/Alert';
import { imageUrl } from '../../utils/format';

const MAX_IMAGES = 8; // same limits as the server
const MAX_FILES_PER_UPLOAD = 5;
const MAX_MB = 5;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

// Upload and remove the images of one product (admin only).
// `onChange` is called with the updated product after each upload or removal.
export default function ImageManager({ product, onChange }) {
  const fileInput = useRef(null);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: 'error', text: '' });

  const handlePick = (e) => {
    const picked = Array.from(e.target.files);
    setMessage({ type: 'error', text: '' });

    // Check on the device first so mistakes are reported instantly (the server checks again)
    const problem =
      picked.length > MAX_FILES_PER_UPLOAD
        ? `Choose up to ${MAX_FILES_PER_UPLOAD} images at a time`
        : product.images.length + picked.length > MAX_IMAGES
          ? `A product can have up to ${MAX_IMAGES} images`
          : picked.find((f) => !ALLOWED.includes(f.type))
            ? `${picked.find((f) => !ALLOWED.includes(f.type)).name} is not a JPG, PNG or WebP image`
            : picked.find((f) => f.size > MAX_MB * 1024 * 1024)
              ? `${picked.find((f) => f.size > MAX_MB * 1024 * 1024).name} is larger than ${MAX_MB} MB`
              : '';

    if (problem) {
      setMessage({ type: 'error', text: problem });
      e.target.value = '';
      setFiles([]);
      return;
    }
    setFiles(picked);
  };

  const handleUpload = async () => {
    setBusy(true);
    setMessage({ type: 'error', text: '' });
    try {
      const updated = await uploadProductImages(product._id, files);
      onChange(updated);
      setFiles([]);
      if (fileInput.current) fileInput.current.value = '';
      setMessage({ type: 'success', text: 'Images uploaded' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (image) => {
    if (!window.confirm('Remove this image?')) return;
    setBusy(true);
    setMessage({ type: 'error', text: '' });
    try {
      onChange(await deleteProductImage(product._id, image._id));
      setMessage({ type: 'success', text: 'Image removed' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Images</h2>
      <p className="mt-1 text-sm text-slate-500">
        Use real photos of the product (JPG, PNG or WebP, up to {MAX_MB} MB each). The first image is shown on product
        cards. {product.images.length} of {MAX_IMAGES} used.
      </p>

      <div className="mt-4">
        <Alert type={message.type}>{message.text}</Alert>
      </div>

      {product.images.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {product.images.map((image, index) => (
            <li key={image._id} className="overflow-hidden rounded-md border border-slate-200">
              <img src={imageUrl(image.url, 300)} alt={`${product.name} ${index + 1}`} className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-xs text-slate-500">{index === 0 ? 'Main image' : `Image ${index + 1}`}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleRemove(image)}
                  className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No images yet.</p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="image-files" className="sr-only">
          Choose images
        </label>
        <input
          id="image-files"
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || product.images.length >= MAX_IMAGES}
          onChange={handlePick}
          className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={busy || files.length === 0}
          className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {busy ? 'Working...' : `Upload${files.length ? ` (${files.length})` : ''}`}
        </button>
      </div>
    </div>
  );
}