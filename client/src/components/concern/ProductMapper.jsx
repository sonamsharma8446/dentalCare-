import { useEffect, useState } from 'react';
import { getAdminProducts } from '../../api/adminCatalogApi';
import { addProductToConcern, removeProductFromConcern } from '../../api/adminConcernApi';
import ProductImage from '../product/ProductImage';
import FormField from '../common/FormField';
import Alert from '../common/Alert';

const RESULT_LIMIT = 10;

// Link products to one concern (admin only).
// `products` are the products linked right now. `onChange` is called with the new list after every add or remove.
export default function ProductMapper({ concernId, products, onChange }) {
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState(''); // the search the results below are showing
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: 'error', text: '' });

  // Find products to add. Runs once when the section opens, then again for every search.
  useEffect(() => {
    let cancelled = false;
    setSearching(true);

    getAdminProducts({ limit: RESULT_LIMIT, ...(search && { search }) })
      .then((data) => !cancelled && setResults(data.products))
      .catch((error) => !cancelled && setMessage({ type: 'error', text: error.message }))
      .finally(() => !cancelled && setSearching(false));

    return () => {
      cancelled = true;
    };
  }, [search]);

  const linkedIds = new Set(products.map((p) => p._id));
  const addable = results.filter((p) => !linkedIds.has(p._id));

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(draft.trim());
  };

  const run = async (action, successText) => {
    setBusy(true);
    setMessage({ type: 'error', text: '' });
    try {
      onChange(await action());
      setMessage({ type: 'success', text: successText });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = (product) => run(() => addProductToConcern(concernId, product._id), `"${product.name}" linked`);

  const handleRemove = (product) => {
    if (!window.confirm(`Unlink "${product.name}" from this concern? The product itself is not deleted.`)) return;
    return run(() => removeProductFromConcern(concernId, product._id), `"${product.name}" unlinked`);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Linked products</h2>
      <p className="mt-1 text-sm text-slate-500">
        Only link products that are appropriate for this concern according to your source. Hidden products stay linked
        but are not shown on the website.
      </p>

      <div className="mt-4">
        <Alert type={message.type}>{message.text}</Alert>
      </div>

      {/* Currently linked */}
      <h3 className="mt-4 text-sm font-semibold text-slate-700">Linked now ({products.length})</h3>
      {products.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No products linked yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200">
          {products.map((product) => (
            <li key={product._id} className="flex items-center gap-3 p-3">
              <ProductImage image={product.images?.[0]} alt="" width={100} className="h-10 w-10 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {[product.brand, product.category?.name].filter(Boolean).join(' · ')}
                  {!product.isActive && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-slate-700">Hidden</span>}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleRemove(product)}
                className="shrink-0 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                Unlink
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Find more to link */}
      <h3 className="mt-6 text-sm font-semibold text-slate-700">Add a product</h3>
      <form onSubmit={handleSearch} className="mt-2 flex flex-wrap items-end gap-3">
        <FormField
          label="Search products"
          name="mapperSearch"
          type="search"
          placeholder="Name or brand"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-w-0 flex-1 basis-48"
        />
        <button type="submit" className="rounded-md bg-slate-800 px-5 py-2 text-sm font-medium text-white hover:bg-slate-900">
          Search
        </button>
      </form>

      <div className="mt-3" aria-live="polite">
        {searching ? (
          <p className="text-sm text-slate-500">Searching...</p>
        ) : addable.length === 0 ? (
          <p className="text-sm text-slate-500">
            {results.length === 0 ? 'No products found. Add products first on the Products screen.' : 'Every product found is already linked.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
            {addable.map((product) => (
              <li key={product._id} className="flex items-center gap-3 p-3">
                <ProductImage image={product.images?.[0]} alt="" width={100} className="h-10 w-10 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                  <p className="truncate text-xs text-slate-500">{[product.brand, product.category?.name].filter(Boolean).join(' · ')}</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAdd(product)}
                  className="shrink-0 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  Link
                </button>
              </li>
            ))}
          </ul>
        )}
        {!searching && results.length === RESULT_LIMIT && (
          <p className="mt-2 text-xs text-slate-500">Showing the first {RESULT_LIMIT} matches. Search to narrow the list.</p>
        )}
      </div>
    </div>
  );
}