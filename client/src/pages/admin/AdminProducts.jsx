import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProducts, getAdminCategories, deleteProduct } from '../../api/adminCatalogApi';
import ProductImage from '../../components/product/ProductImage';
import SelectField from '../../components/common/SelectField';
import FormField from '../../components/common/FormField';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../utils/format';

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const [filters, setFilters] = useState({ search: '', category: '', isActive: '' });
  const [applied, setApplied] = useState(filters); // what the list is currently showing
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ products: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: 'error', text: '' });

  useEffect(() => {
    getAdminCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      for (const [key, value] of Object.entries(applied)) if (value) params[key] = value;
      setResult(await getAdminProducts(params));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, [applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied({ ...filters, search: filters.search.trim() });
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}" and all its images? This cannot be undone.`)) return;
    setMessage({ type: 'error', text: '' });
    try {
      await deleteProduct(product._id);
      setMessage({ type: 'success', text: `"${product.name}" was deleted` });
      // If that was the last product on this page, go back one page
      if (result.products.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const { products, pagination } = result;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Products</h2>
        <Link to="/admin/products/new" className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Add product
        </Link>
      </div>

      <form onSubmit={applyFilters} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <FormField label="Search" name="search" type="search" placeholder="Name or brand" value={filters.search} onChange={handleFilterChange} />
        <SelectField label="Category" name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Status" name="isActive" value={filters.isActive} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="true">Visible on website</option>
          <option value="false">Hidden</option>
        </SelectField>
        <button type="submit" className="rounded-md bg-slate-800 px-5 py-2 text-sm font-medium text-white hover:bg-slate-900">
          Filter
        </button>
      </form>

      <Alert type={message.type}>{message.text}</Alert>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {pagination?.total === 0 && !applied.search && !applied.category && !applied.isActive
            ? 'No products yet. Add a category first, then add your first product.'
            : 'No products match these filters.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage image={product.images[0]} alt="" width={100} className="h-12 w-12 shrink-0 rounded-md" />
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        {product.brand && <p className="text-xs text-slate-500">{product.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{product.category?.name}</td>
                  <td className="px-4 py-3 text-slate-700">{formatPrice(product.price)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                        {product.isActive ? 'Visible' : 'Hidden'}
                      </span>
                      {!product.inStock && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Out of stock</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link to={`/admin/products/${product._id}/edit`} className="mr-3 font-medium text-teal-700 hover:underline">
                      Edit
                    </Link>
                    <button type="button" onClick={() => handleDelete(product)} className="font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />}
    </div>
  );
}