import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getConcerns } from '../../api/concernApi';
import ConcernCard from '../../components/concern/ConcernCard';
import FormField from '../../components/common/FormField';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

export default function Concerns() {
  // The search text lives in the page address (?search=...), so Back and shared links work
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const [draft, setDraft] = useState(search);
  const [concerns, setConcerns] = useState([]);
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

    getConcerns(search ? { search } : {}, controller.signal)
      .then((data) => {
        setConcerns(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return; // a newer request replaced this one
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    setSearchParams(text ? { search: text } : {});
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Dental Concerns</h1>
      <p className="mt-2 text-slate-600">
        General information about common dental concerns. This is not a substitute for professional dental advice.
        Consult a dentist if you are worried about your teeth or gums.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <FormField
          label="Search concerns"
          name="search"
          type="search"
          placeholder="For example a concern name"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-w-0 flex-1 basis-56"
        />
        <button type="submit" className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </form>

      <div className="mt-6" aria-live="polite">
        {error && <Alert>{error}</Alert>}

        {loading && <Loader label="Loading concerns..." />}

        {!loading && !error && concerns.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
            <p className="font-medium text-slate-700">{search ? 'No concerns match your search' : 'No concerns have been added yet'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {search ? 'Try a different word or clear the search.' : 'Please check back soon.'}
            </p>
          </div>
        )}

        {!loading && !error && concerns.length > 0 && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {concerns.length} {concerns.length === 1 ? 'concern' : 'concerns'}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {concerns.map((concern) => (
                <ConcernCard key={concern._id} concern={concern} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}