import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminVideos, getAdminVideoCategories, deleteVideo } from '../../api/adminContentApi';
import SelectField from '../../components/common/SelectField';
import FormField from '../../components/common/FormField';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { thumbnailUrl } from '../../utils/youtube';

const PAGE_SIZE = 10;

export default function AdminVideos() {
  const [filters, setFilters] = useState({ search: '', category: '', isActive: '' });
  const [applied, setApplied] = useState(filters); // what the list is currently showing
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ videos: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: 'error', text: '' });

  useEffect(() => {
    getAdminVideoCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      for (const [key, value] of Object.entries(applied)) if (value) params[key] = value;
      setResult(await getAdminVideos(params));
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

  const handleDelete = async (video) => {
    if (!window.confirm(`Delete the video "${video.title}"? This cannot be undone. (The video on YouTube is not affected.)`)) return;
    setMessage({ type: 'error', text: '' });
    try {
      await deleteVideo(video._id);
      setMessage({ type: 'success', text: `"${video.title}" was deleted` });
      // If that was the last video on this page, go back one page
      if (result.videos.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const { videos, pagination } = result;
  const filtered = Boolean(applied.search || applied.category || applied.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Videos</h2>
        <Link to="/admin/videos/new" className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Add video
        </Link>
      </div>

      <form onSubmit={applyFilters} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <FormField label="Search" name="search" type="search" placeholder="Title or description" value={filters.search} onChange={handleFilterChange} />
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
      ) : videos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {filtered ? 'No videos match these filters.' : 'No videos yet. Add a video category first, then add your first video.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Video</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {videos.map((video) => (
                <tr key={video._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={thumbnailUrl(video.youtubeId)} alt="" loading="lazy" className="h-12 w-20 shrink-0 rounded-md bg-slate-100 object-cover" />
                      <p className="font-medium text-slate-900">{video.title}</p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{video.category?.name}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${video.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                      {video.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link to={`/admin/videos/${video._id}/edit`} className="mr-3 font-medium text-teal-700 hover:underline">
                      Edit
                    </Link>
                    <button type="button" onClick={() => handleDelete(video)} className="font-medium text-red-600 hover:underline">
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