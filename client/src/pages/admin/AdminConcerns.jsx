import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminConcerns, deleteConcern } from '../../api/adminConcernApi';
import SelectField from '../../components/common/SelectField';
import FormField from '../../components/common/FormField';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

export default function AdminConcerns() {
  const [filters, setFilters] = useState({ search: '', isActive: '' });
  const [applied, setApplied] = useState(filters); // what the list is currently showing
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: 'error', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      for (const [key, value] of Object.entries(applied)) if (value) params[key] = value;
      setConcerns(await getAdminConcerns(params));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    setApplied({ ...filters, search: filters.search.trim() });
  };

  const handleDelete = async (concern) => {
    if (!window.confirm(`Delete the concern "${concern.name}"? Linked products are not deleted, only unlinked.`)) return;
    setMessage({ type: 'error', text: '' });
    try {
      await deleteConcern(concern._id);
      setMessage({ type: 'success', text: `"${concern.name}" was deleted` });
      await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const filtered = Boolean(applied.search || applied.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Dental concerns</h2>
        <Link to="/admin/concerns/new" className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Add concern
        </Link>
      </div>

      <form onSubmit={applyFilters} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3 sm:items-end">
        <FormField label="Search" name="search" type="search" placeholder="Name or summary" value={filters.search} onChange={handleFilterChange} />
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
      ) : concerns.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {filtered ? 'No concerns match these filters.' : 'No concerns yet. Add your first one.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Concern</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {concerns.map((concern) => (
                <tr key={concern._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{concern.name}</p>
                    {concern.summary && <p className="max-w-md truncate text-xs text-slate-500">{concern.summary}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{concern.productCount}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${concern.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                      {concern.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link to={`/admin/concerns/${concern._id}/edit`} className="mr-3 font-medium text-teal-700 hover:underline">
                      Edit
                    </Link>
                    <button type="button" onClick={() => handleDelete(concern)} className="font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}