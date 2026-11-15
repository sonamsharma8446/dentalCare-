import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminArticles, deleteArticle } from '../../api/adminContentApi';
import SelectField from '../../components/common/SelectField';
import FormField from '../../components/common/FormField';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { kindLabel } from '../../components/article/ArticleCard';

const PAGE_SIZE = 10;

export default function AdminArticles() {
  const [filters, setFilters] = useState({ search: '', kind: '', isActive: '' });
  const [applied, setApplied] = useState(filters); // what the list is currently showing
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ articles: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: 'error', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      for (const [key, value] of Object.entries(applied)) if (value) params[key] = value;
      setResult(await getAdminArticles(params));
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

  const handleDelete = async (article) => {
    if (!window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    setMessage({ type: 'error', text: '' });
    try {
      await deleteArticle(article._id);
      setMessage({ type: 'success', text: `"${article.title}" was deleted` });
      // If that was the last item on this page, go back one page
      if (result.articles.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const { articles, pagination } = result;
  const filtered = Boolean(applied.search || applied.kind || applied.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Articles and instructions</h2>
        <Link to="/admin/articles/new" className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Add article
        </Link>
      </div>

      <form onSubmit={applyFilters} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <FormField label="Search" name="search" type="search" placeholder="Title or summary" value={filters.search} onChange={handleFilterChange} />
        <SelectField label="Type" name="kind" value={filters.kind} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="article">Articles</option>
          <option value="instruction">Instructions</option>
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
      ) : articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {filtered ? 'No articles match these filters.' : 'No articles yet. Add your first one.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Type</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((article) => (
                <tr key={article._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{article.title}</p>
                    {article.summary && <p className="max-w-md truncate text-xs text-slate-500">{article.summary}</p>}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{kindLabel[article.kind]}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${article.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                      {article.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link to={`/admin/articles/${article._id}/edit`} className="mr-3 font-medium text-teal-700 hover:underline">
                      Edit
                    </Link>
                    <button type="button" onClick={() => handleDelete(article)} className="font-medium text-red-600 hover:underline">
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