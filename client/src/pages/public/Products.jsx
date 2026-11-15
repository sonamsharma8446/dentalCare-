import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../../api/catalogApi';
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/product/ProductFilters';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const PAGE_SIZE = 12;

export default function Products() {
  // All filters live in the page address (?category=...&sort=...), so the Back button,
  // bookmarks and shared links all work.
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ products: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const values = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    sort: searchParams.get('sort') || 'newest',
  };
  const query = searchParams.toString();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {}); // the filter just shows no categories if this fails
  }, []);

  // Load products again whenever the address changes
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getProducts({ ...Object.fromEntries(new URLSearchParams(query)), limit: PAGE_SIZE }, controller.signal)
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return; // a newer request replaced this one
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  // Change some filters. Empty values are removed. Any change except paging goes back to page 1.
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      const text = String(value ?? '').trim();
      if (text) next.set(key, text);
      else next.delete(key);
    }
    if (!('page' in changes)) next.delete('page');
    if (next.get('sort') === 'newest') next.delete('sort'); // newest is the default
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const { products, pagination } = result;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Products</h1>
      <p className="mt-2 text-slate-600">
        Read each product's label and usage instructions carefully. Product details here are for general information only.
      </p>

      <div className="mt-6">
        {/* The key resets the text boxes whenever the filters in the address change (Back button, Clear) */}
        <ProductFilters key={query} values={values} categories={categories} onChange={updateParams} onClear={clearFilters} />
      </div>

      <div className="mt-6" aria-live="polite">
        {error && <Alert>{error}</Alert>}

        {loading && <Loader label="Loading products..." />}

        {!loading && !error && pagination && (
          <p className="mb-4 text-sm text-slate-500">
            {pagination.total} {pagination.total === 1 ? 'product' : 'products'} found
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
            <p className="font-medium text-slate-700">No products found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search or clear the filters.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {!loading && pagination && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={(newPage) => {
            updateParams({ page: newPage === 1 ? '' : newPage });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </section>
  );
}