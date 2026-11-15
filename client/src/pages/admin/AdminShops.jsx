import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminShops, deleteShop } from '../../api/adminShopApi';
import SelectField from '../../components/common/SelectField';
import FormField from '../../components/common/FormField';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { hasLocation } from '../../utils/maps';

const PAGE_SIZE = 10;

export default function AdminShops() {
  const [filters, setFilters] = useState({ search: '', isActive: '' });
  const [applied, setApplied] = useState(filters); // what the list is currently showing
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ shops: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: 'error', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      for (const [key, value] of Object.entries(applied)) if (value) params[key] = value;
      setResult(await getAdminShops(params));
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

  const handleDelete = async (shop) => {
    if (!window.confirm(`Delete the shop "${shop.name}"? This cannot be undone.`)) return;
    setMessage({ type: 'error', text: '' });
    try {
      await deleteShop(shop._id);
      setMessage({ type: 'success', text: `"${shop.name}" was deleted` });
      // If that was the last shop on this page, go back one page
      if (result.shops.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const { shops, pagination } = result;
  const filtered = Boolean(applied.search || applied.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Medical shops</h2>
        <Link to="/admin/shops/new" className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Add shop
        </Link>
      </div>

      <form onSubmit={applyFilters} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto] lg:items-end">
        <FormField label="Search" name="search" type="search" placeholder="Name, address, city or PIN code" value={filters.search} onChange={handleFilterChange} />
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
      ) : shops.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {filtered ? 'No shops match these filters.' : 'No shops yet. Add your first one.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Shop</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">City</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Map</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shops.map((shop) => (
                <tr key={shop._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{shop.name}</p>
                    <p className="max-w-xs truncate text-xs text-slate-500">{shop.address}</p>
                    <p className="text-xs text-slate-500">{shop.phone}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{shop.city}</td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{hasLocation(shop) ? 'Yes' : 'No'}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${shop.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                      {shop.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link to={`/admin/shops/${shop._id}/edit`} className="mr-3 font-medium text-teal-700 hover:underline">
                      Edit
                    </Link>
                    <button type="button" onClick={() => handleDelete(shop)} className="font-medium text-red-600 hover:underline">
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