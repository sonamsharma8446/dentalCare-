import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getVideoCategories, getVideos } from '../../api/contentApi';
import VideoCard from '../../components/video/VideoCard';
import FormField from '../../components/common/FormField';
import SelectField from '../../components/common/SelectField';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const PAGE_SIZE = 12;

export default function Videos() {
  // Filters live in the page address (?category=...&search=...), so Back and shared links work
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const query = searchParams.toString();

  const [draft, setDraft] = useState(search);
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ videos: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Keep the text box in step with the address (Back button, Clear)
  useEffect(() => {
    setDraft(search);
  }, [search]);

  useEffect(() => {
    getVideoCategories()
      .then(setCategories)
      .catch(() => {}); // the filter just shows no categories if this fails
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getVideos({ ...Object.fromEntries(new URLSearchParams(query)), limit: PAGE_SIZE }, controller.signal)
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
    setSearchParams(next);
  };

  const { videos, pagination } = result;
  const hasFilters = Boolean(search || category);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Videos</h1>
      <p className="mt-2 text-slate-600">
        Educational videos about dental care, hosted on YouTube. They are for general information and are not a
        substitute for professional dental advice.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParams({ search: draft });
        }}
        className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto] lg:items-end"
      >
        <FormField label="Search videos" name="search" type="search" placeholder="Title or description" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <SelectField label="Category" name="category" value={category} onChange={(e) => updateParams({ search: draft, category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name} ({c.videoCount})
            </option>
          ))}
        </SelectField>
        <div className="flex gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
          <button type="submit" className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
            Search
          </button>
        </div>
      </form>

      <div className="mt-6" aria-live="polite">
        {error && <Alert>{error}</Alert>}
        {loading && <Loader label="Loading videos..." />}

        {!loading && !error && pagination && (
          <p className="mb-4 text-sm text-slate-500">
            {pagination.total} {pagination.total === 1 ? 'video' : 'videos'} found
          </p>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
            <p className="font-medium text-slate-700">{hasFilters ? 'No videos found' : 'No videos have been added yet'}</p>
            <p className="mt-1 text-sm text-slate-500">{hasFilters ? 'Try a different search or clear the filters.' : 'Please check back soon.'}</p>
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
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