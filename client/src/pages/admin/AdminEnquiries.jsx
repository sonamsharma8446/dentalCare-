import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { getAdminEnquiries, downloadEnquiriesCsv } from '../../api/adminEnquiryApi';
import EnquiryStatus from '../../components/admin/EnquiryStatus';
import SelectField from '../../components/common/SelectField';
import FormField from '../../components/common/FormField';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/date';

const PAGE_SIZE = 10;

export default function AdminEnquiries() {
  // Filters live in the page address, so the dashboard can link straight to "new" enquiries
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const page = Number(searchParams.get('page')) || 1;

  const [draft, setDraft] = useState(search);
  const [result, setResult] = useState({ enquiries: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(location.state?.message ? { type: 'success', text: location.state.message } : { type: 'error', text: '' });

  useEffect(() => {
    setDraft(search);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    if (search) params.search = search;
    if (status) params.status = status;
    getAdminEnquiries(params)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage({ type: 'error', text: error.message });
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, status, page]);

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

  const handleExport = async () => {
    setExporting(true);
    setMessage({ type: 'error', text: '' });
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      await downloadEnquiriesCsv(params);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setExporting(false);
    }
  };

  const { enquiries, pagination } = result;
  const filtered = Boolean(search || status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Enquiries</h2>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {exporting ? 'Preparing...' : 'Download as CSV'}
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParams({ search: draft });
        }}
        className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto] lg:items-end"
      >
        <FormField label="Search" name="search" type="search" placeholder="Name, email, message or product" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <SelectField label="Status" name="status" value={status} onChange={(e) => updateParams({ search: draft, status: e.target.value })}>
          <option value="">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </SelectField>
        <div className="flex gap-2">
          {filtered && (
            <button type="button" onClick={() => setSearchParams({})} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Clear
            </button>
          )}
          <button type="submit" className="rounded-md bg-slate-800 px-5 py-2 text-sm font-medium text-white hover:bg-slate-900">
            Filter
          </button>
        </div>
      </form>

      <Alert type={message.type}>{message.text}</Alert>

      {loading ? (
        <Loader />
      ) : enquiries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {filtered ? 'No enquiries match these filters.' : 'No enquiries yet. Messages sent from the Contact page appear here.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">About</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Received</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.map((enquiry) => (
                <tr key={enquiry._id} className={enquiry.status === 'new' ? 'bg-amber-50/40' : ''}>
                  <td className="px-4 py-3">
                    <p className={enquiry.status === 'new' ? 'font-semibold text-slate-900' : 'font-medium text-slate-900'}>{enquiry.name}</p>
                    <p className="text-xs text-slate-500">{enquiry.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{enquiry.productName || 'General question'}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 sm:table-cell">{formatDateTime(enquiry.createdAt)}</td>
                  <td className="px-4 py-3">
                    <EnquiryStatus status={enquiry.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link to={`/admin/enquiries/${enquiry._id}`} className="font-medium text-teal-700 hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={(newPage) => updateParams({ page: newPage === 1 ? '' : newPage })}
        />
      )}
    </div>
  );
}