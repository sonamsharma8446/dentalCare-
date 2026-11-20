import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct, getRelatedProducts } from '../../api/catalogApi';
import ProductImage from '../../components/product/ProductImage';
import ProductCard from '../../components/product/ProductCard';
import WarningBox from '../../components/product/WarningBox';
import Loader from '../../components/common/Loader';
import { formatPrice, imageUrl } from '../../utils/format';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selected, setSelected] = useState(0); // which image is shown large
  const [status, setStatus] = useState('loading'); // loading | ready | notFound | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setSelected(0);
    setRelated([]);
    window.scrollTo({ top: 0 });

    getProduct(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setStatus('ready');
        // Related products are a bonus: if they fail to load the page still works
        getRelatedProducts(slug)
          .then((items) => !cancelled && setRelated(items))
          .catch(() => {});
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) setStatus('notFound');
        else {
          setErrorMessage(err.message);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') return <Loader label="Loading product..." />;

  if (status !== 'ready') {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">
          {status === 'notFound' ? 'Product not found' : 'Could not load this product'}
        </h1>
        <p className="mt-2 text-slate-500">
          {status === 'notFound' ? 'It may have been removed or the link is incorrect.' : errorMessage}
        </p>
        <Link to="/products" className="mt-6 inline-block rounded-md bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700">
          Back to Products
        </Link>
      </section>
    );
  }

  const { images } = product;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to="/products" className="hover:text-teal-700 hover:underline">
          Products
        </Link>
        {product.category && (
          <>
            {' / '}
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-teal-700 hover:underline">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <ProductImage
            image={images[selected]}
            alt={product.name}
            width={900}
            className="aspect-square w-full rounded-lg border border-slate-200"
          />
          {images.length > 1 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {images.map((img, index) => (
                <li key={img._id}>
                  <button
                    type="button"
                    onClick={() => setSelected(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === selected}
                    className={`block h-16 w-16 overflow-hidden rounded-md border-2 ${
                      index === selected ? 'border-teal-600' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={imageUrl(img.url, 150)} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main details */}
        <div>
          {product.brand && <p className="text-sm font-medium uppercase tracking-wide text-teal-700">{product.brand}</p>}
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900">{formatPrice(product.price)}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                product.inStock ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {product.inStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">Description</h2>
              <p className="mt-2 whitespace-pre-line text-slate-700">{product.description}</p>
            </div>
          )}

          {product.usageInstructions && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">How to use</h2>
              <p className="mt-2 whitespace-pre-line text-slate-700">{product.usageInstructions}</p>
            </div>
          )}


          {product.precautions.length > 0 && (
            <div className="mt-6">
              <WarningBox title="Precautions">
                <ul className="list-disc space-y-1 pl-5">
                  {product.precautions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </WarningBox>
            </div>
          )}

          {product.concerns?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">Related dental concerns</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {product.concerns.map((concern) => (
                  <li key={concern._id}>
                    <Link
                      to={`/concerns/${concern.slug}`}
                      className="inline-block rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800 hover:bg-teal-100"
                    >
                      {concern.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6">
            <Link
              to={`/contact?product=${product.slug}`}
              className="inline-block rounded-md border border-teal-600 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
            >
              Ask a question about this product
            </Link>
          </p>

          <div className="mt-6">
            <WarningBox title="Before you use this product">
              <p>
                Read the product label and follow the manufacturer's instructions. The information on this page is for
                general education and is not a substitute for professional dental advice. Consult a dentist if you have
                any concerns.
              </p>
            </WarningBox>
          </div>

          {product.sourceNote && (
            <p className="mt-4 text-xs text-slate-500">Information source: {product.sourceNote}</p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold text-slate-900">More from {product.category?.name || 'this category'}</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}