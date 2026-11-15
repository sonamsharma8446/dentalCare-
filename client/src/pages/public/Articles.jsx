import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getArticles } from '../../api/contentApi';
import ArticleCard from '../../components/article/ArticleCard';
import FormField from '../../components/common/FormField';
import SelectField from '../../components/common/SelectField';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const PAGE_SIZE = 12;

export default function Articles() {
  // Filters live in the page address (?kind=...&search=...), so Back and shared links work
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const kind = searchParams.get('kind') || '';
  const query = searchParams.toString();

  const [draft, setDraft] = useState(search);
  const [result, setResult] = useState({ articles: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Keep the text box in step with the address (Back button, Clear)
  useEffect(() => {
    setDraft(search);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getArticles({ ...Object.fromEntries(new URLSearchParams(query)), limit: PAGE_SIZE }, controller.signal)
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

  const { articles, pagination } = result;
  const hasFilters = Boolean(search || kind);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Articles and Instructions</h1>
      <p className="mt-2 text-slate-600">
        Reading material and care instructions. They are for general information and are not a substitute for
        professional dental advice.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParams({ search: draft });
        }}
        className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto] lg:items-end"
      >
        <FormField label="Search" name="search" type="search" placeholder="Title or summary" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <SelectField label="Type" name="kind" value={kind} onChange={(e) => updateParams({ search: draft, kind: e.target.value })}>
          <option value="">All</option>
          <option value="article">Articles</option>
          <option value="instruction">Instructions</option>
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
        {loading && <Loader label="Loading..." />}

        {!loading && !error && pagination && (
          <p className="mb-4 text-sm text-slate-500">
            {pagination.total} {pagination.total === 1 ? 'item' : 'items'} found
          </p>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
            <p className="font-medium text-slate-700">{hasFilters ? 'Nothing found' : 'No articles have been added yet'}</p>
            <p className="mt-1 text-sm text-slate-500">{hasFilters ? 'Try a different search or clear the filters.' : 'Please check back soon.'}</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
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